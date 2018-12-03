const { NeuralNetwork } = require('brain.js');

class Nlu {
  constructor(textProcessor, netConfig) {
    this.trainData = [];
    this.textProcessor = textProcessor;
    this.netConfig = netConfig || { errorThresh: 0.0005 };
  }

  process(text) {
    return this.textProcessor.process(text);
  }

  textToObservations(text, label) {
    const data = this.process(text);
    const result = [];
    const observation = {
      input: {}
    }
    data.forEach(feature => {
      observation.input[feature] = 1;     
    })
    if (label) {
      observation.output = {};
      observation.output[label] = 1;
    }
    result.push(observation);
    return result;
  }

  addObservation(utterance, intent) {
    this.trainData.push(...this.textToObservations(utterance, intent));
  }

  createNetwork() {
    return new NeuralNetwork(this.netConfig);
  }

  async train() {
    this.net = this.createNetwork();
    await this.net.train(this.trainData);
  }

  normalize(classifications) {
    let total = 0;
    for (let i = 0; i < classifications.length; i += 1) {
      total += classifications[i].value;
    }
    if (total > 0) {
      const result = [];
      for (let i = 0; i < classifications.length; i += 1) {
        result.push({
          label: classifications[i].label,
          value: classifications[i].value / total,
        });
      }
      return result;
    }
    return classifications;
  }

  classify(text) {
    const observations = this.textToObservations(text);
    let result = undefined;
    observations.forEach(observation => {
      if (Object.keys(observation.input).length === 0) {
        return [{ label: 'None', value: 1 }];
      }
      const classification = this.net.run(observation.input);
      let scores = [];
      Object.keys(classification).forEach(label => {
        scores.push({ label, value: classification[label] });
      });
      scores = scores.sort((x, y) => y.value - x.value);
      if (!result || result[0].value < scores[0].value) {
        result = scores;
      }
    });
    return this.normalize(result);
  }
}

module.exports = Nlu;