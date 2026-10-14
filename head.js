(function(){var th;try{th=localStorage.getItem('netsim_theme');}catch(e){}
if(th!=="light"&&th!=="dark")th=(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches)?"light":"dark";
document.documentElement.setAttribute('data-theme',th);})();