const Decimal = require('decimal.js')

const plus = (input1, input2) => new Decimal(input1 || 0).plus(input2 || 0).toFixed()
const minus = (input1, input2) => new Decimal(input1 || 0).minus(input2 || 0).toFixed()
const mul = (input1, input2) => new Decimal(input1 || 0).mul(input2 || 0).toFixed()
const divided = (input1, input2) => new Decimal(input1 || 0).dividedBy(input2 || 0).toFixed()

module.exports = { plus, minus, mul, divided }
