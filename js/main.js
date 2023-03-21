var boton = document.getElementById("boton");
var textoOculto = document.querySelector(".oculto");
var textoVisible = document.querySelector(".texto");

boton.addEventListener("click", function() {
  if (textoOculto.style.display === "none") {
    textoOculto.style.display = "block";
    textoVisible.style.height = "170vh";
    boton.innerHTML = "Mostrar menos";
  } else {
    textoOculto.style.display = "none";
    textoVisible.style.height = "80vh";
    boton.innerHTML = "Mostrar más";
  }
});


