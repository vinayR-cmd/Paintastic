const canvas = document.querySelector("canvas")
const toolBtns = document.querySelectorAll(".tool")
const fillColor = document.querySelector("#fill-color")
const sizeSlider = document.querySelector("#size-slider")
const colorBtns = document.querySelectorAll(".colors .option")
const colorPicker = document.querySelector("#color-picker")
const clearCanvas = document.querySelector(".clear-canvas")
const saveImg = document.querySelector(".save-image")
const ctx = canvas.getContext("2d")

let prevMouseX, prevMouseY, snapshot,
   isDrawing = false,
   brushWidth = sizeSlider.value,
   selectedTool = "brush",
   selectedColor = "#000";

const setCanvasBackground = () => {
   ctx.fillStyle = "#fff";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = selectedColor;
}

window.addEventListener("load", () => {
   canvas.width = canvas.offsetWidth;
   canvas.height = canvas.offsetHeight;
   setCanvasBackground();
});

const getXY = (e) => {
   if (e.type.includes("touch")) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
         x: touch.clientX - canvas.offsetLeft,
         y: touch.clientY - canvas.offsetTop
      };
   }
   return { x: e.offsetX, y: e.offsetY };
}

const drawRect = (x, y) => {
   if (!fillColor.checked) {
      return ctx.strokeRect(x, y, prevMouseX - x, prevMouseY - y);
   }
   ctx.fillRect(x, y, prevMouseX - x, prevMouseY - y);
}

const drawCircle = (x, y) => {
   ctx.beginPath();
   let radius = Math.sqrt(Math.pow((prevMouseX - x), 2) + Math.pow((prevMouseY - y), 2));
   ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
   fillColor.checked ? ctx.fill() : ctx.stroke();
}

const drawTriangle = (x, y) => {
   ctx.beginPath();
   ctx.moveTo(prevMouseX, prevMouseY);
   ctx.lineTo(x, y);
   ctx.lineTo(prevMouseX * 2 - x, y);
   ctx.closePath();
   fillColor.checked ? ctx.fill() : ctx.stroke();
}

const startDraw = (e) => {
   e.preventDefault();
   isDrawing = true;
   const { x, y } = getXY(e);
   prevMouseX = x;
   prevMouseY = y;
   ctx.beginPath();
   ctx.lineWidth = brushWidth;
   snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
   ctx.strokeStyle = selectedColor;
   ctx.fillStyle = selectedColor;
}

const stop = () => {
   isDrawing = false;
}

const drawing = (e) => {
   if (!isDrawing) return;
   e.preventDefault();
   const { x, y } = getXY(e);
   ctx.putImageData(snapshot, 0, 0);

   if (selectedTool === "brush" || selectedTool === "eraser") {
      ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
      ctx.lineTo(x, y);
      ctx.stroke();
   }
   else if (selectedTool === "rectangle") {
      drawRect(x, y);
   }
   else if (selectedTool === "circle") {
      drawCircle(x, y);
   }
   else if (selectedTool === "triangle") {
      drawTriangle(x, y);
   }
}

toolBtns.forEach(btn => {
   btn.addEventListener("click", () => {
      document.querySelector(".options .active").classList.remove("active");
      btn.classList.add("active");
      selectedTool = btn.id;
   });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

colorBtns.forEach(btn => {
   btn.addEventListener("click", () => {
      document.querySelector(".options .selected").classList.remove("selected");
      btn.classList.add("selected");
      selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
   });
});

colorPicker.addEventListener("change", () => {
   colorPicker.parentElement.style.background = colorPicker.value;
   colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   setCanvasBackground();
});

saveImg.addEventListener("click", () => {
   const link = document.createElement("a");
   link.download = `${Date.now()}.jpg`;
   link.href = canvas.toDataURL();
   link.click();
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("touchmove", drawing, { passive: false });
canvas.addEventListener("mouseup", stop);
canvas.addEventListener("mouseleave", stop);
canvas.addEventListener("touchcancel", stop);
canvas.addEventListener("touchend", stop);