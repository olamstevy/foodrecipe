const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const recipemodel = require('./models/recipe');


const app = express();


// Connecting to Database
const dbURI = "mongodb+srv://foodrecipe:foodrecipe@recipe.yzlwjgh.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(dbURI)
    .then(() => {
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(err => console.log(err));


// Middleware and Static Files
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set('view engine', 'ejs')
app.use(morgan('tiny'));
const upload = multer({ dest: path.join(__dirname, '/uploads') });


// Routing

//Get methods
app.get('/', (req, res) => {
    res.render('index', {page_title: 'Home'});
});

app.get('/home', (req, res) => {
    res.redirect('/');
});

app.get('/create-recipe', (req, res) => {
    res.render('create-recipe', {page_title: 'Add Recipe'});
});

app.get('/edit-recipe/:id', (req, res) => {
    const recipeId = req.params.id;
    recipemodel.findById(recipeId)
    .then(result => {
        res.render('edit-recipe', {page_title: 'Edit Recipe', recipe: result});
    }); 
})

app.get('/fullrecipe/:id', (req, res) => {
    const recipeId = req.params.id;
    recipemodel.findById(recipeId)
    .then(result => {
        res.render('fullrecipe', {page_title: 'Full Recipe', recipe: result});
    });
});

app.get('/recipe', (req, res) => {
    recipemodel.find()
    .sort({updatedAt: -1})
    .then((result) => {
        res.render('recipe', {page_title: 'Recipe', recipe_list: result})
    })
});

app.get('/about', (req, res) => {
    res.render('about', {page_title: 'About'});
});

app.delete('/delete-recipe/:id', (req, res) => {
    recipemodel.findByIdAndDelete(req.params.id)
    .exec()
    .then((result) => console.log('success'))
    .catch((err) => console.error(err))
    res.send('/recipe');
})

app.put('/edit-recipe', (req, res) => {
    const recipeId = new mongoose.Types.ObjectId(req.body.recipe_id);
    recipemodel.findOneAndUpdate(
        {_id: recipeId},
        {
            name: req.body.recipe_name,
            desc: req.body.recipe_desc,
            ingr: req.body.recipe_ingr,
            instr: req.body.recipe_instr,
        })
        .then(result => {
            res.send(JSON.stringify(result));
        })
        .catch(err => {console.log(err)})
})

app.post('/create-recipe-submit', upload.single('recipe_img'), (req, res) => {
    const recipeImg = req.file;

    var add_recipe = new recipemodel({
        name: req.body.recipe_name,
        desc: req.body.recipe_desc,
        ingr: req.body.recipe_ingr,
        instr: req.body.recipe_instr,
        img: " ",
    });

    add_recipe.save()
        .then((data) => {
            add_recipe.img = `/recipe_images/img_${(data._id).toString()}${path.extname(recipeImg.originalname)}`;
            return add_recipe.save();
        })
        .then((updatedData) => {
            console.log(updatedData);
            var updatedRecipeId = updatedData._id;

            //saving file to public folder
            const newImgPath = path.join(__dirname, '/public/', updatedData.img);
            fs.renameSync(recipeImg.path, newImgPath);
            // fs.unlinkSync(recipeImg.path);
            res.send(JSON.stringify({updatedRecipeId}));
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('An error occurred while saving the recipe.');
        });
});


app.get('/database', (req, res) => {
    var latest_recipe = new recipemodel({
        name: 'Creamy Mushroom Risoto',
        desc: 'Indulge the rich and flavorful Creamy Mushroom Risotoo, a classic I talian Dish that combines the earth goodness of mushrooms with the creamy texture of Arborio rice.',
        ingr: 'Arborio rice, Mushrooms, Onion, Garlic, Vegetable broth, White wine, Parmesan cheese, Butter, Olive oil, Salt, Black pepper',
        instr: 'Arborio rice, Mushrooms, Onion, Garlic, Vegetable broth, White wine, Parmesan cheese, Butter, Olive oil, Salt, Black pepper',
        img: 'homepage.png',
    })
    var info;
    latest_recipe.save()
    .then((data)=> {info = data})
    .catch((err)=> {info = data});
    res.send(info);
});

app.use((req, res) => {
    res.send(req.url);
});
