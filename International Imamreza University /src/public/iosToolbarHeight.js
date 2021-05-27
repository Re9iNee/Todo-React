// ios toolbar bug/feature
resize()
window.addEventListener('resize', () => {
    resize()
});
function resize() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}