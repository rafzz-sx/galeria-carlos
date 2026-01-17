const imagens = document.querySelectorAll(".foto")
imagens.forEach(img => {
    img.addEventListener("click", () =>{
        const info = img.nextElementSibling;
        info.classList.toggle("ativo");
 });
});