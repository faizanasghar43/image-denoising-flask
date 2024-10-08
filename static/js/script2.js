let slider = document.querySelector("input[type='range']");
let beforeImage = document.querySelector(".image-before");
let afterImage = document.querySelector(".image-after");
let beforeSelector = document.querySelector("#before-selector");
let afterSelector = document.querySelector("#after-selector");

let beforeImageWidth = getComputedStyle(beforeImage).width.slice(
  0,
  getComputedStyle(beforeImage).width.indexOf("p")
);

slider.addEventListener("input", (e) => {
  adjustImage(e.target);
});

function adjustImage(target) {
  beforeImage.style.width = `${(target.value / 100) * beforeImageWidth}px`;
}

function updateImage() {
  if (beforeSelector.files && beforeSelector.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Display the selected image

      beforeImage.style.background = `url("${e.target.result}")`;
    };
    reader.readAsDataURL(beforeSelector.files[0]);
  }

  if (afterSelector.files && afterSelector.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      // Display the selected image
      afterImage.style.background = `url("${e.target.result}")`;
    };
    reader.readAsDataURL(afterSelector.files[0]);
  }
}

adjustImage(slider);

console.log("imageee script");

document.getElementById("mobile-menu").addEventListener("click", function () {
  document.querySelector(".nav-links ul").classList.toggle("active");
});
