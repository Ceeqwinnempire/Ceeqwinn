document.addEventListener("DOMContentLoaded", async () => {

    const container = document.getElementById("articles");

    try {

        const response = await fetch("content/articles/index.json");

        if (!response.ok) {
            throw new Error("Couldn't load articles.");
        }

        const articles = await response.json();

        container.innerHTML = "";

        articles.forEach(article => {

            const link = document.createElement("a");

            link.href = `article.html?file=${article.slug}`;
            link.textContent = article.title;

            container.appendChild(link);

        });

    } catch (err) {

        console.error(err);

        container.innerHTML = "<p>Unable to load articles.</p>";

    }

});
