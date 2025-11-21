const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const postsDir = path.join(__dirname, '../posts');
const docsDir = path.join(__dirname, '../docs');
const templatesDir = path.join(__dirname, '../templates');

// Create docs/posts directory if it doesn't exist
const docsPostsDir = path.join(docsDir, 'posts');
if (!fs.existsSync(docsPostsDir)) {
    fs.mkdirSync(docsPostsDir, { recursive: true });
}

// Read all markdown files
const filenames = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));

const posts = filenames.map(filename => {
    const slug = filename.replace('.md', '');
    const filePath = path.join(postsDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
        slug,
        ...data,
        content: marked(content)
    };
}).sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate individual post pages
const postTemplate = fs.readFileSync(path.join(templatesDir, 'post.html'), 'utf-8');

posts.forEach(post => {
    let postHtml = postTemplate;
    const postWithRelativeImagePath = { ...post, featuredImage: `../${post.featuredImage}` };
    for (const key in postWithRelativeImagePath) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        postHtml = postHtml.replace(regex, postWithRelativeImagePath[key]);
    }

    fs.writeFileSync(path.join(docsPostsDir, `${post.slug}.html`), postHtml);
});

// Update the homepage
const listItemTemplate = fs.readFileSync(path.join(templatesDir, 'post-list-item.html'), 'utf-8');
const indexTemplatePath = path.join(templatesDir, 'index.html');
let indexTemplate = fs.readFileSync(indexTemplatePath, 'utf-8');

const latestPostsHtml = posts.slice(0, 20).map(post => {
    let itemHtml = listItemTemplate;
    itemHtml = itemHtml.replace(/{{link}}/g, `/posts/${post.slug}.html`);
    for (const key in post) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        itemHtml = itemHtml.replace(regex, post[key]);
    }
    return itemHtml;
}).join('');

indexTemplate = indexTemplate.replace('{{latestPosts}}', latestPostsHtml);

// Featured article
if (posts.length > 0) {
    const featured = posts[0];
    const featuredHtml = `
        <a href="/posts/${featured.slug}.html">
            <h1>${featured.title}</h1>
            <p>${featured.description}</p>
        </a>
    `;
    indexTemplate = indexTemplate.replace('{{featuredArticle}}', featuredHtml);
} else {
    indexTemplate = indexTemplate.replace('{{featuredArticle}}', '<p>No featured articles yet.</p>');
}

fs.writeFileSync(path.join(docsDir, 'index.html'), indexTemplate);

// Generate JSON feed
const feed = posts.map(post => {
    return {
        title: post.title,
        date: post.date,
        author: post.author,
        category: post.category,
        description: post.description,
        link: `/posts/${post.slug}.html`
    };
});
fs.writeFileSync(path.join(docsDir, 'feed.json'), JSON.stringify(feed, null, 2));

// Copy assets
fs.copySync(path.join(__dirname, '../css'), path.join(docsDir, 'css'));
fs.copySync(path.join(__dirname, '../js'), path.join(docsDir, 'js'));
fs.copySync(path.join(__dirname, '../images'), path.join(docsDir, 'images'));


console.log('Build complete!');
