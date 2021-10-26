let openVideo = document.querySelector('.hero-section__video-btn');
let closeVideo = document.querySelector('.popup__close');
let popup = document.querySelector('.popup');

// ? Youtube video modal

const videoTrigger = document.querySelector('[data-video]');

if (videoTrigger) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    let player;
    openVideo.addEventListener("click", function (e) {
        popup.classList.add("active");
        let videoId = videoTrigger.getAttribute('data-video');
        player = new YT.Player('popup__video', {
            width: "100%",
            height: "100%",
            videoId: videoId,
            events: {
                onReady: onPlayerReady,
            },
        });
        let videoOptions = player.h.src.split("?").pop();
        player.h.setAttribute("src", `https://www.youtube.com/embed/${videoId}?${videoOptions}`);

        function onPlayerReady(event) {
            event.target.playVideo();
        };

    });
    const videoDestroy = () => {
        setTimeout(() => {
            player.destroy();
        }, 300);
    };
    document.getElementById("video-popup").addEventListener("click", function (e) {
        if (!e.target.closest(".popup__body")) {
            videoDestroy();
            popup.classList.remove("active");
        }
    });
    closeVideo.addEventListener('click', function () {
        popup.classList.remove("active");
        videoDestroy();
    });
    document.addEventListener("keydown", function (e) {
        if (e.which === 27) {
            videoDestroy();
        }
    });
}