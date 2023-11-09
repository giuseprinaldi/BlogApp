import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

const bArray = [];


// Functions
function requestToRenderData(req){
    return {
        title: req.body["title"],
        blog: req.body["blog"],
        titlesArray: bArray,
    }
}

function arrayPush (req, res, next) {
    if (req.body['title']) {
        bArray.push(req.body['title']);
    }
    console.log(bArray);
    next();
}


// Middleware
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


// GET Requests
app.get("/", (req, res) => {
    res.render('index.ejs')
});

app.get("/bloglist", (req, res) => {
    res.render('bloglist.ejs', requestToRenderData(req));
});

app.get("/newblog", (req, res) => {
    res.render('newblog.ejs')
});

app.get("/blog/:title", (req, res) => {
    const title = req.params.title;
    const filePath = path.join(__dirname, `public/blogs/${title}.txt`);

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error('Error reading the file: ', err)
            return;
        }
    
        const jsonData = JSON.parse(data);
        res.render('blog.ejs', {jsonData});
    });
});

// Edit Blog Text
app.get("/edit/:title", (req, res) => {
    const title = req.params.title;
    const filePath = path.join(__dirname, `public/blogs/${title}.txt`);

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error('Error reading the file: ', err)
            return;
        }
        const jsonData = JSON.parse(data);
        res.render('edit.ejs', {jsonData});
    });
});



// Update txt file when editing
app.post("/update/:title", async (req, res) => {
    try {
        const title = req.params.title;
        const updatedTitle = req.body.title;

        const currentFilePath = path.join(__dirname, `public/blogs/${title}.txt`);
        const newFilePath = path.join(__dirname, `public/blogs/${updatedTitle}.txt`);


        if (currentFilePath !== newFilePath){

            await new Promise((resolve, reject) => {
                fs.writeFile(newFilePath, JSON.stringify(requestToRenderData(req)), 'utf8', (err) => {
                    if (err) {
                        console.error('Error editing the file: ', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                    bArray.push(updatedTitle);
                });
            });

            await new Promise((resolve, reject) => {      
                fs.unlink(currentFilePath, (err) =>{
                    if (err) {
                        console.error('Error deleting the file: ', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                    const index = bArray.indexOf(title);
                    if (index !== -1) {
                    bArray.splice(index, 1);
                    }
                });   
            });
        }
            const data = await new Promise((resolve, reject) => {
                fs.readFile(newFilePath, 'utf-8', (err, fileData) => {
                    if (err) {
                        console.error('Error reading the file: ', err)
                        reject(err);
                    } else {
                        resolve(fileData);
                    }
                });
            });
        
            const jsonData = JSON.parse(data);
            res.render('blog.ejs', {jsonData});
        } catch (error) {
            console.error('An error occurred:', error);
            res.status(500).send('Error updating the file');
        }
});



// Post
app.post("/submit", (req,res) => {
    fs.writeFile(`public/blogs/${req.body["title"]}.txt`, JSON.stringify(requestToRenderData(req)), (err) =>{
        if (err) throw (err);
        console.log("This file have been saved!");
    });
    bArray.push(req.body['title']);
    res.render('submit.ejs', requestToRenderData(req));
});


// Delete post
app.get("/delete/:title", (req, res) => {
    const title = req.params.title;
    const filePath = path.join(__dirname, `public/blogs/${title}.txt`);

    fs.unlink(filePath, (err) => {
        if (err) throw (err);

        const index = bArray.indexOf(title);
        if (index !== -1) {
            bArray.splice(index, 1);
        }
    });
    res.redirect("/");
});

// Listening Function
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

