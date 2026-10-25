
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  /* ========================================
     1. FIRST-PAGE INVITATION NAVIGATION
  ======================================== */

  const invitationCard = document.getElementById("invitation-card");

  if (invitationCard) {
    invitationCard.addEventListener("click", () => {
      window.location.href = "invitation.html";
    });
  }

  /* ========================================
     2. WEDDING COUNTDOWN
     27 November 2026, Pakistan time
  ======================================== */

  const countdown = document.getElementById("wedding-countdown");

  if (countdown) {
    const daysElement = countdown.querySelector('[data-unit="days"]');
    const hoursElement = countdown.querySelector('[data-unit="hours"]');
    const minutesElement = countdown.querySelector('[data-unit="minutes"]');
    const secondsElement = countdown.querySelector('[data-unit="seconds"]');
    const messageElement = document.getElementById("countdown-message");

    if (daysElement && hoursElement && minutesElement && secondsElement) {
      const targetDate = new Date(
        "2026-11-27T00:00:00+05:00"
      ).getTime();

      function updateCountdown() {
        const remaining = targetDate - Date.now();

        if (remaining <= 0) {
          daysElement.textContent = "00";
          hoursElement.textContent = "00";
          minutesElement.textContent = "00";
          secondsElement.textContent = "00";

          if (messageElement) {
            messageElement.textContent = "The special day has arrived!";
          }

          clearInterval(countdownInterval);
          return;
        }

        daysElement.textContent = String(
          Math.floor(remaining / 86400000)
        ).padStart(2, "0");

        hoursElement.textContent = String(
          Math.floor((remaining % 86400000) / 3600000)
        ).padStart(2, "0");

        minutesElement.textContent = String(
          Math.floor((remaining % 3600000) / 60000)
        ).padStart(2, "0");

        secondsElement.textContent = String(
          Math.floor((remaining % 60000) / 1000)
        ).padStart(2, "0");
      }

      let countdownInterval = setInterval(updateCountdown, 1000);
      updateCountdown();
    } else {
      console.error("Countdown HTML elements could not be found.");
    }
  }

  /* ========================================
     3. WEDDING MUSIC PLAYER
  ======================================== */

  const audio = new Audio("./assets/audio/wedding-music.mp3");
  const musicTimeKey = "weddingMusicTime";
  const targetVolume = 0.32;

  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;

  let fadeTimer = null;
  let restorePromise = null;

  // Save the song position before leaving the page.
  function saveMusicPosition() {
    if (Number.isFinite(audio.currentTime) && audio.currentTime > 0) {
      try {
        sessionStorage.setItem(
          musicTimeKey,
          String(audio.currentTime)
        );
      } catch (error) {
        console.warn("Could not save the music position.", error);
      }
    }
  }

  audio.addEventListener("timeupdate", saveMusicPosition);
  window.addEventListener("pagehide", saveMusicPosition);

  // Create the music button.
  const button = document.createElement("button");

  button.type = "button";
  button.id = "wedding-music-player";
  button.textContent = "▶ Play Music";
  button.setAttribute("aria-label", "Play wedding music");

  Object.assign(button.style, {
    position: "fixed",
    bottom: "22px",
    right: "22px",
    zIndex: "99999",
    padding: "13px 19px",
    borderRadius: "30px",
    border: "1px solid #c9a45c",
    background: "#650f25",
    color: "#fff5df",
    fontFamily: "Georgia, serif",
    fontSize: "14px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
    transition: "background 0.3s ease"
  });

  document.body.appendChild(button);

  // Restore the music position saved by the previous page.
  function restoreMusicPosition() {
    if (restorePromise) {
      return restorePromise;
    }

    restorePromise = (async () => {
      let savedTime = 0;

      try {
        savedTime = Number(
          sessionStorage.getItem(musicTimeKey) || "0"
        );
      } catch (error) {
        console.warn("Could not read the saved music position.", error);
      }

      if (savedTime <= 0) {
        return;
      }

      if (audio.readyState < 1) {
        await new Promise((resolve) => {
          const finish = () => resolve();

          audio.addEventListener("loadedmetadata", finish, {
            once: true
          });

          audio.addEventListener("error", finish, {
            once: true
          });

          audio.load();
        });
      }

      if (
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        audio.currentTime = Math.min(
          savedTime,
          Math.max(0, audio.duration - 0.25)
        );
      }
    })();

    return restorePromise;
  }

  // Gradually increase volume over about three seconds.
  function fadeInMusic() {
    clearInterval(fadeTimer);

    audio.volume = 0;
    let step = 0;
    const totalSteps = 30;

    fadeTimer = setInterval(() => {
      step++;

      audio.volume = Math.min(
        targetVolume,
        (targetVolume / totalSteps) * step
      );

      if (step >= totalSteps) {
        clearInterval(fadeTimer);
        fadeTimer = null;
      }
    }, 100);
  }

  // Play the music and update the button.
  async function playMusic() {
    try {
      clearInterval(fadeTimer);
      fadeTimer = null;

      await restoreMusicPosition();
      await audio.play();

      button.textContent = "Ⅱ Pause Music";
      button.setAttribute("aria-label", "Pause wedding music");

      fadeInMusic();
    } catch (error) {
      button.textContent = "▶ Play Music";
      button.setAttribute("aria-label", "Play wedding music");

      console.error("Wedding music could not play:", error);
    }
  }

  // Play/Pause button.
  button.addEventListener("click", async () => {
    if (!audio.paused) {
      saveMusicPosition();

      clearInterval(fadeTimer);
      fadeTimer = null;

      audio.pause();

      button.textContent = "▶ Play Music";
      button.setAttribute("aria-label", "Play wedding music");
    } else {
      await playMusic();
    }
  });

  // Try to start automatically when the page opens.
  playMusic();
});
