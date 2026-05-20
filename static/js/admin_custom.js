// Desliga o autocomplete nativo das barras de pesquisa do painel Admin
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('nav.app-header form input.form-control');
    searchInputs.forEach(function(input) {
        input.setAttribute('autocomplete', 'off');
    });
});
