# demo-nlp

Steps to run this demo:

- clone this repo
- Execute:
```sh
npm install
node index
```

You will see something like this:
```json
{ AskUbuntuCorpus: 0.8440366972477065,
  ChatbotCorpus: 0.9528301886792453,
  WebApplicationsCorpus: 0.6440677966101694,
  Total: 0.843065693430657 }
```

<div align="center">
<img src="https://github.com/jesus-seijas-sp/demo-nlp/raw/master/screenshots/result01.png" width="auto" height="auto"/>
</div>

## Explanation

Based on the SIGDIAL22 paper: http://www.aclweb.org/anthology/W17-5522 to evaluate NLU, we want to build a NLU classifier and compare with existing products in the market.
We are using Brain.js for this purpose.

By default this code gets the sentences, tokenize the sentences, and train a neural network using Brain.js. 
Then several improvements can be done as explained here:

## Improve 1: leaky-relu

We can improve the results using leaky-relu as activation function. To do this, replace the index code with:

```javascript
const Score = require('./score');

const configNet = {
  activation: 'leaky-relu', 
}

async function main() {
  const score = new Score(configNet, ['tokenize']);
  const result = await score.process();
  console.log(result);
}

main();
```

This will be the result:
```json
{ AskUbuntuCorpus: 0.8623853211009176,
  ChatbotCorpus: 0.9716981132075472,
  WebApplicationsCorpus: 0.6779661016949152,
  Total: 0.864963503649635 }
```
<div align="center">
<img src="https://github.com/jesus-seijas-sp/demo-nlp/raw/master/screenshots/result02.png" width="auto" height="auto"/>
</div>

## Improve 2: no hidden layers

By default, Brain.js puts 3 hidden layers in the network. We can avoid that by modifying the configNet:

```javascript
const configNet = {
  activation: 'leaky-relu',
  hiddenLayers: [],
}
```

The result:
```json
{ AskUbuntuCorpus: 0.8899082568807339,
  ChatbotCorpus: 0.9811320754716981,
  WebApplicationsCorpus: 0.6610169491525424,
  Total: 0.8759124087591241 }
```
<div align="center">
<img src="https://github.com/jesus-seijas-sp/demo-nlp/raw/master/screenshots/result03.png" width="auto" height="auto"/>
</div>

## Improve 3: Error Threshold

By default the error threshold of Brain.js is 0.005. Let's change it to 0.0005.

```javascript
const configNet = {
  activation: 'leaky-relu',
  hiddenLayers: [],
  errorThresh: 0.0005
}
```

The result:
```json
{ AskUbuntuCorpus: 0.8807339449541285,
  ChatbotCorpus: 0.9905660377358491,
  WebApplicationsCorpus: 0.6949152542372882,
  Total: 0.8832116788321168 }
```
<div align="center">
<img src="https://github.com/jesus-seijas-sp/demo-nlp/raw/master/screenshots/result04.png" width="auto" height="auto"/>
</div>

### Improve 4: Lower Case

Right now we are tokenizing with the source case, so "developer" is a different word from "Developer".
We want to apply lower case to the sentences before tokenizing them, so we apply the "lower" to the pipeline:

```javascript
const Score = require('./score');

const configNet = {
  activation: 'leaky-relu',
  hiddenLayers: [],
  errorThresh: 0.0005
}

async function main() {
  const score = new Score(configNet, ['lower', 'tokenize']);
  const result = await score.process();
  console.log(result);
}

main();
```

The result:
```json
{ AskUbuntuCorpus: 0.908256880733945,
  ChatbotCorpus: 0.9905660377358491,
  WebApplicationsCorpus: 0.7457627118644068,
  Total: 0.9051094890510949 }
```

<div align="center">
<img src="https://github.com/jesus-seijas-sp/demo-nlp/raw/master/screenshots/result05.png" width="auto" height="auto"/>
</div>

### Improve 5: Porter stemmer

An stemmer is an algorithm to calculate the stems of the words, example, from "developer", "developing", "developed" the stem is "develop".
There are thre famous stemmers: Porter, Snowball (Porter2) and Lancaster.
In the library Nlp.js the Snowball (Porter2) is the one used, but for this example we are using the library Natural, that has the Porter and Lancaster. 
First at all let's use Porter Stemmer:

```javascript
const Score = require('./score');

const configNet = {
  activation: 'leaky-relu',
  hiddenLayers: [],
  errorThresh: 0.0005
}

async function main() {
  const score = new Score(configNet, ['lower', 'tokenize', 'stem'], true, false);
  const result = await score.process();
  console.log(result);
}

main();
```

The result:
```json
{ AskUbuntuCorpus: 0.9174311926605505,
  ChatbotCorpus: 0.9905660377358491,
  WebApplicationsCorpus: 0.7966101694915254,
  Total: 0.9197080291970803 }
```

<div align="center">
<img src="https://github.com/jesus-seijas-sp/demo-nlp/raw/master/screenshots/result06.png" width="auto" height="auto"/>
</div>

### Improve 6: Porter and Lancaster stemmer

Porter and Lancaster stemmers returns almost always the same result, but for some words the result is different. 
We can train with both together: if the stem generated for one words is different, then train with both stems.

```javascript
const Score = require('./score');

const configNet = {
  activation: 'leaky-relu',
  hiddenLayers: [],
  errorThresh: 0.0005
}

async function main() {
  const score = new Score(configNet, ['lower', 'tokenize', 'stem'], true, true);
  const result = await score.process();
  console.log(result);
}

main();
```

The result:
```json
{ AskUbuntuCorpus: 0.9174311926605505,
  ChatbotCorpus: 0.9905660377358491,
  WebApplicationsCorpus: 0.8135593220338985,
  Total: 0.9233576642335767 }
```
<div align="center">
<img src="https://github.com/jesus-seijas-sp/demo-nlp/raw/master/screenshots/result07.png" width="auto" height="auto"/>
</div>

## Using NLP.js

You can get even a better score using NLP.js https://github.com/axa-group/nlp.js
<div align="center">
<img src="https://github.com/jesus-seijas-sp/demo-nlp/raw/master/screenshots/resultnlpjs.png" width="auto" height="auto"/>
</div>

