"use strict";

var openVideo = document.querySelector('.hero-section__video-btn');
var closeVideo = document.querySelector('.popup__close');
var popup = document.querySelector('.popup'); // ? Youtube video modal

var videoTrigger = document.querySelector('[data-video]');

if (videoTrigger) {
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  var player;
  openVideo.addEventListener("click", function (e) {
    popup.classList.add("active");
    var videoId = videoTrigger.getAttribute('data-video');
    player = new YT.Player('popup__video', {
      width: "100%",
      height: "100%",
      videoId: videoId,
      events: {
        onReady: onPlayerReady
      }
    });
    var videoOptions = player.h.src.split("?").pop();
    player.h.setAttribute("src", "https://www.youtube.com/embed/".concat(videoId, "?").concat(videoOptions));

    function onPlayerReady(event) {
      event.target.playVideo();
    }

    ;
  });

  var videoDestroy = function videoDestroy() {
    setTimeout(function () {
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

; // Lazy Loading

function yall(options) {
  options = options || {}; // Options

  var lazyClass = options.lazyClass || "lazy";
  var lazyBackgroundClass = options.lazyBackgroundClass || "lazy-bg";
  var idleLoadTimeout = "idleLoadTimeout" in options ? options.idleLoadTimeout : 200;
  var observeChanges = options.observeChanges || false;
  var events = options.events || {};
  var noPolyfill = options.noPolyfill || false; // Shorthands (saves more than a few bytes!)

  var win = window;
  var ric = "requestIdleCallback";
  var io = "IntersectionObserver";
  var ioSupport = io in win && "".concat(io, "Entry") in win; // App stuff

  var crawler = /baidu|(?:google|bing|yandex|duckduck)bot/i.test(navigator.userAgent);
  var dataAttrs = ["srcset", "src", "poster"];
  var arr = [];

  var queryDOM = function queryDOM(selector, root) {
    return arr.slice.call((root || document).querySelectorAll(selector || "img.".concat(lazyClass, ",video.").concat(lazyClass, ",iframe.").concat(lazyClass, ",.").concat(lazyBackgroundClass)));
  }; // This function handles lazy loading of elements.


  var yallLoad = function yallLoad(element) {
    var parentNode = element.parentNode;

    if (parentNode.nodeName == "PICTURE") {
      yallApplyFn(queryDOM("source", parentNode), yallFlipDataAttrs);
    }

    if (element.nodeName == "VIDEO") {
      yallApplyFn(queryDOM("source", element), yallFlipDataAttrs);
    }

    yallFlipDataAttrs(element);
    var classList = element.classList; // Lazy load CSS background images

    if (classList.contains(lazyBackgroundClass)) {
      classList.remove(lazyBackgroundClass);
      classList.add(options.lazyBackgroundLoaded || "lazy-bg-loaded");
    }
  };

  var yallBindEvents = function yallBindEvents(element) {
    for (var eventIndex in events) {
      element.addEventListener(eventIndex, events[eventIndex].listener || events[eventIndex], events[eventIndex].options || undefined);
    }
  }; // Added because there was a number of patterns like this peppered throughout
  // the code. This flips necessary data- attrs on an element and prompts video
  // elements to begin playback automatically if they have autoplay specified.


  var yallFlipDataAttrs = function yallFlipDataAttrs(element) {
    for (var dataAttrIndex in dataAttrs) {
      if (dataAttrs[dataAttrIndex] in element.dataset) {
        element.setAttribute(dataAttrs[dataAttrIndex], element.dataset[dataAttrs[dataAttrIndex]]);
        var parentNode = element.parentNode;

        if (element.nodeName === "SOURCE" && parentNode.autoplay) {
          parentNode.load(); // For some reason, IE11 needs to have this method invoked in order
          // for autoplay to start. So we do a yucky user agent check.

          if (/Trident/.test(navigator.userAgent)) {
            parentNode.play();
          }

          parentNode.classList.remove(lazyClass);
        }

        element.classList.remove(lazyClass);
      }
    }
  }; // Noticed lots of loops where a function simply gets executed on every
  // member of an array. This abstraction eliminates that repetitive code.


  var yallApplyFn = function yallApplyFn(items, fn) {
    for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
      win[io] && fn instanceof win[io] ? fn.observe(items[itemIndex]) : fn(items[itemIndex]);
    }
  };

  var yallCreateMutationObserver = function yallCreateMutationObserver(entry) {
    new MutationObserver(function () {
      yallApplyFn(queryDOM(), function (newElement) {
        if (lazyElements.indexOf(newElement) < 0) {
          lazyElements.push(newElement);
          yallBindEvents(newElement);

          if (ioSupport && !crawler) {
            intersectionListener.observe(newElement);
          } else if (noPolyfill || crawler) {
            yallApplyFn(lazyElements, yallLoad);
          }
        }
      });
    }).observe(entry, options.mutationObserverOptions || {
      childList: true,
      subtree: true
    });
  };

  var lazyElements = queryDOM();
  yallApplyFn(lazyElements, yallBindEvents); // First we check if IntersectionObserver is supported. If not, we check to
  // see if the `noPolyfill` option is set. If so, we load everything. If the
  // current user agent is a known crawler, again, we load everything.

  if (ioSupport && !crawler) {
    var intersectionListener = new win[io](function (entries) {
      yallApplyFn(entries, function (entry) {
        if (entry.isIntersecting || entry.intersectionRatio) {
          var element = entry.target;

          if (ric in win && idleLoadTimeout) {
            win[ric](function () {
              yallLoad(element);
            }, {
              timeout: idleLoadTimeout
            });
          } else {
            yallLoad(element);
          }

          intersectionListener.unobserve(element);
          lazyElements = lazyElements.filter(function (lazyElement) {
            return lazyElement != element;
          }); // If all the elements that were detected at load time are all loaded
          // and we're not observing for changes, we're all done here.

          if (!lazyElements.length && !observeChanges) {
            intersectionListener.disconnect();
          }
        }
      });
    }, {
      rootMargin: "".concat("threshold" in options ? options.threshold : 200, "px 0%")
    });
    yallApplyFn(lazyElements, intersectionListener);

    if (observeChanges) {
      yallApplyFn(queryDOM(options.observeRootSelector || "body"), yallCreateMutationObserver);
    }
  } else if (noPolyfill || crawler) {
    yallApplyFn(lazyElements, yallLoad);
  }
}

;
document.addEventListener("DOMContentLoaded", yall); // Scroll Animation

var animItems = document.querySelectorAll('.anim-items');

if (animItems.length > 0) {
  var offset = function offset(el) {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrolltop = window.pageYOffset || document.documentElement.scrollTop;
    return {
      top: rect.top + scrolltop,
      left: rect.left + screenLeft
    };
  };

  var animOnScroll = function animOnScroll() {
    for (var index = 0; index < animItems.length; index++) {
      var animItem = animItems[index];
      var animItemHeight = animItem.offsetHeight;
      var animItemOffset = offset(animItem).top;
      var animStart = 3;
      var animItemPoint = window.innerHeight - animItemHeight / animStart;

      if (animItemHeight > window.innerHeight) {
        animItemPoint = window.innerHeight - window.innerHeight / animStart;
      }

      if (pageYOffset > animItemOffset - animItemPoint && pageYOffset < animItemOffset + animItemHeight) {
        animItem.classList.add('_active');
      } else {
        if (!animItem.classList.contains('no-anim')) {
          animItem.classList.remove('_active');
        }
      }
    }
  };

  window.addEventListener('scroll', animOnScroll);
  setTimeout(function () {
    animOnScroll();
  }, 1000);
}

;
var navButton = document.querySelector('.menu-icon');

if (navButton) {
  var nav = document.querySelector('.nav');
  navButton.addEventListener("click", function (e) {
    navButton.classList.toggle('_active');

    if (!nav.classList.contains('nav--active')) {
      nav.classList.add('nav--active');
    } else {
      nav.classList.remove('nav--active');
    }
  });
}

;