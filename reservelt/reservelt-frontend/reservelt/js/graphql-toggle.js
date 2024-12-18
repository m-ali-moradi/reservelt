document.getElementById('toggleGraphqlButton').addEventListener('click', function() {
    const currentUrl = window.location.href;

    if (currentUrl.includes('?graphql')) {
        const newUrl = currentUrl.replace('?graphql', '');
        window.history.pushState({}, '', newUrl); 
    } else {
        const newUrl = currentUrl.includes('?') ? `${currentUrl}&graphql` : `${currentUrl}?graphql`;
        window.history.pushState({}, '', newUrl);
    }
});