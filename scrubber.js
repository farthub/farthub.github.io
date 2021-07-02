var scrub;

var pause = document.getElementById("pause");
var play = document.getElementById("play");

function prevYear() {
  if (currentYear === 1981) {
    currentYear = 2015;
  }
  setYear(currentYear - 1);
  updateGraph();
}

function nextYear() {
  if (currentYear === 2014) {
    currentYear = 1980;
  }
  setYear(currentYear + 1);
  updateGraph();
}

function startForward() {
  nextYear();
  scrub = setInterval(nextYear, 3000);

  // disable play button, enable pause button
  play.disabled = true;
  pause.disabled = false;

}

function stopForward() {
  clearInterval(scrub);

  // disable pause button, enable play button
  pause.disabled = true;
  play.disabled = false;
}