const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');

require('dotenv').config();
  
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.u6bk12m.mongodb.net/albanewsBD`, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    serverSelectionTimeoutMS: 60000 
});

// Configuração de Sessão com MongoDB Store
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.u6bk12m.mongodb.net/albanewsBD`}),
}));

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar pasta pública
app.use(express.static(path.join(__dirname, 'public')));

// Modelo de Notícia
const newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    image: String,
    authors: String,
    publicationDate: {
        type: Date,
        default: Date.now
    }
});
const News = mongoose.model('News', newsSchema);

// Rota para exibir as últimas 5 notícias
app.get('/', async (req, res) => {
    const news = await News.find().sort({ publicationDate: -1 }).limit(5);
    res.render('index', { news });
});

// Rota para Notícias
app.get('/noticias', async (req, res) => {
    const news = await News.find().sort({ publicationDate: -1 }); // Busca todas as notícias, ordenadas pela data
    res.render('noticias', { news }); // Passa as notícias para o template
});

// Rota para exibir uma notícia específica
app.get('/noticias/:id', async (req, res) => {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
        return res.status(404).send('Notícia não encontrada');
    }

    // Dividir o conteúdo em linhas
    const contentLines = newsItem.content.split('\n'); // Supondo que cada parágrafo está em uma nova linha
    let column1Content = '';
    let column2Content = '';

    if (contentLines.length > 5) {
        column1Content = contentLines.slice(0, 5).join('\n');
        column2Content = contentLines.slice(5).join('\n');
    } else {
        column1Content = newsItem.content; // Se não exceder 5 linhas, coloca tudo na primeira coluna
    }

    // Atualiza o newsItem com os novos conteúdos
    newsItem.column1Content = column1Content;
    newsItem.column2Content = column2Content;

    res.render('news', { newsItem });
});


// Rota para Sobre
app.get('/sobre', (req, res) => {
    res.render('sobre');  // Renderiza o arquivo sobre.ejs
});

// Rota para Contato
app.get('/contato', (req, res) => {
    res.render('contato');  // Renderiza o arquivo contato.ejs
});

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
