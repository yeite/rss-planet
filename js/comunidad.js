const COLLECTION_URL = "https://masto.es/api/v1/collections/116771427317007236";

function safeUrl(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}

function createAccountItem(account) {
    const item = document.createElement("li");
    item.className = "community-list-item";

    const avatarUrl = safeUrl(account.avatar);
    if (avatarUrl) {
        const avatar = document.createElement("img");
        avatar.className = "community-avatar";
        avatar.src = avatarUrl;
        avatar.alt = account.display_name || "";
        item.append(avatar);
    }

    const accountUrl = safeUrl(account.url);
    if (accountUrl) {
        const link = document.createElement("a");
        link.href = accountUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const name = document.createElement("strong");
        name.textContent = account.display_name || account.acct || "Cuenta";
        link.append(name, ` (${account.acct || ""})`);
        item.append(link);
    } else {
        item.append(account.display_name || account.acct || "Cuenta");
    }

    return item;
}

async function loadCollection() {
    const container = document.getElementById("mi-lista-mastodon");

    try {
        const response = await fetch(COLLECTION_URL);
        if (!response.ok) throw new Error("No se pudo obtener la colección");

        const collection = await response.json();
        const accounts = collection.accounts || [];
        const uniqueAccounts = [...new Map(accounts.map((account) => [account.url, account])).values()];

        const title = document.createElement("h3");
        title.textContent = collection.title || "Comunidad ¡Blog!¡Blog! en Mastodon";

        const list = document.createElement("ul");
        list.className = "community-list";
        list.append(...uniqueAccounts.map(createAccountItem));
        container.replaceChildren(title, list);
    } catch (error) {
        console.error(error);
        container.textContent = "Error al cargar la lista.";
    }
}

loadCollection();
