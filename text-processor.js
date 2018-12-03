const { PorterStemmer } = require('natural');
const { LancasterStemmer } = require('natural');

class TextProcessor {
  constructor(settings) {
    this.settings = settings || {};
    this.pipeline = this.settings.pipeline;
    this.usePorter = this.settings.usePorter === undefined ? true : this.settings.usePorter;
    this.useLancaster = this.settings.useLancaster === undefined ? true : this.settings.useLancaster;
  }

  lower(text) {
    return text.toLowerCase();
  }

  tokenize(text) {
    return text.split(/\W+/);
  }

  stem(tokens) {
    const result = [];
    for (let i = 0; i < tokens.length; i += 1) {
      if (this.useLancaster && this.usePorter) {
        const wordLancaster = LancasterStemmer.stem(tokens[i]);
        result.push(wordLancaster);
        const wordPorter = PorterStemmer.stem(tokens[i]);
        if (wordLancaster !== wordPorter) {
          result.push(wordPorter);
        }
      } else if (this.useLancaster) {
        result.push(LancasterStemmer.stem(tokens[i]));
      } else if (this.usePorter) {
        result.push(PorterStemmer.stem(tokens[i]));
      }
    }
    return result;
  }

  process(text) {
    let result = text;
    for (let i = 0; i < this.pipeline.length; i += 1) {
      const current = this.pipeline[i];
      if (current.endsWith('All') || current.endsWith('all')) {
        result = this.executeAll(current.slice(0, -3), result);
      } else {
        result = this[current](result)        
      }
    }
    return result;
  }
}

module.exports = TextProcessor;