---
layout: null
sitemap: false
---
// Index content for lunr
{% assign counter = 0 %}
var documents = [
    {% for page in site.posts %}
        {
            "id": {{ counter }},
            "url": "{{ site.baseurl }}{{ page.url }}",
            "title": "{{ page.title }}",
            "body": "{{ page.content | markdownify | replace: '.', '. ' | replace: '</h2>', ': ' | replace: '</h3>', ': ' | replace: '</h4>', ': ' | replace: '</p>', ' ' | strip_html | strip_newlines | replace: '  ', ' ' | replace: '"', ' ' }}"
            {% assign counter = counter | plus: 1 %}
        }
        {% if forloop.last %}
        {% else %},
        {% endif %}
    {% endfor %}
];

var idx = lunr(function () {
    this.use(lunr.multiLanguage('en', 'ru'));
    this.ref('id')
    this.field('title')
    this.field('body')
    documents.forEach(function (doc) {
        this.add(doc)
    }, this)
});
