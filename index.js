const Score = require('./score');

const netConfig = {
  activation: 'leaky-relu',
  hiddenLayers: [],
  learningRate: 0.1,
  errorThresh: 0.0005
}

async function main() {
  const score = new Score(netConfig, ['lower', 'tokenize', 'stem']);
  const result = await score.process();
  console.log(result);
}

main();
