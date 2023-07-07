const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    name: {
        type: "String",
        required: "True",
    }, 
    desc: {
        type: "String",
        required: "True",
    }, 
    ingr: {
        type: "String",
        required: "True",
    }, 
    instr: {
        type: "String",
        required: "True",
    }, 
    img: {
        type: "String",
        required: "False",
    },
}, {timestamps: true});

const recipe = mongoose.model('recipe', recipeSchema);
module.exports = recipe;