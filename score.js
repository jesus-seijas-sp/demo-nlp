const glob = require('glob');
const fs = require('fs');
const Nlu = require('./nlu');
const TextProcessor = require('./text-processor');

class Score {
  constructor(netConfig, pipeline, usePorter, useLancaster) {
    this.netConfig = netConfig;
    this.pipeline = pipeline;
    this.usePorter = usePorter;
    this.useLancaster = useLancaster;
  }

  async training(corpus) {
    const textProcessor = new TextProcessor({
      pipeline: this.pipeline,
      usePorter: this.usePorter,
      useLancaster: this.useLancaster
    });
    const nlu = new Nlu(textProcessor, this.netConfig);
    corpus.sentences.forEach(sentence => {
      if (sentence.training) {
        nlu.addObservation(sentence.text, sentence.intent);
      }
    });
    await nlu.train();
    return nlu;
  }

  async processCorpus(corpus) {
    const nlu = await this.training(corpus);
    const result = {
      truePositive: 0,
      falseNegative: 0,
      falsePositive: 0
    }
    corpus.sentences.forEach(sentence => {
      if (!sentence.training) {
        const classification = nlu.classify(sentence.text);
        if (classification[0].label === sentence.intent) {
          result.truePositive += 1;
        } else {
          result.falseNegative += 1;
          result.falsePositive += 1;
        }
      }
    });
    return result;
  }
  
  f1score(data) {
    const precision = data.truePositive / (data.truePositive + data.falseNegative);
    const recall = data.truePositive / (data.truePositive + data.falsePositive);
    return 2 * (precision * recall) / (precision + recall);
  }
  
  process() {
    return new Promise((resolve, reject) => {
      glob('./corpora/*.json', async (err, files) => {
        const result = {};
        const total = {
          truePositive: 0,
          falsePositive: 0,
          falseNegative: 0
        }
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          const corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
          const current = await this.processCorpus(corpus);
          total.truePositive += current.truePositive;
          total.falseNegative += current.falseNegative;
          total.falsePositive += current.falsePositive;
          result[corpus.name] = this.f1score(current);
        }
        result['Total'] = this.f1score(total);
        resolve(result);
      });
    });
  }
}

module.exports = Score;
