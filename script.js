const alphabet = 'abcdefghijklmnopqrstuvwxyz';
let html = "<table><tr>";

for (let letra of alphabet) {
  html += `<th>${letra}</th>`;
}

html += "</tr></table>";

document.getElementById("tableResult").innerHTML = html;
