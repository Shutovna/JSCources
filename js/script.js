"use strict"

document.addEventListener("DOMContentLoaded", () => {
    //tabs
    const tabs = document.querySelectorAll(".tabheader__item");
    const tabsContent = document.querySelectorAll(".tabcontent");
    const tabsParent = document.querySelector(".tabheader__items");

    function hideTabsContent() {
        tabsContent.forEach(item => {
            item.classList.add("hide");
            item.classList.remove("show", "fade");
        });

        tabs.forEach(item => {
            item.classList.remove("tabheader__item_active");
        })
    }

    function showTabContent(i) {
        tabsContent[i].classList.add("show", "fade");
        tabsContent[i].classList.remove("hide");
        tabs[i].classList.add("tabheader__item_active");
    }

    hideTabsContent();
    showTabContent(0);

    tabsParent.addEventListener("click", (e) => {
        let target = e.target;
        if (target.classList.contains("tabheader__item")) {
            tabs.forEach((item, idx) => {
                if (target === item) {
                    hideTabsContent();
                    showTabContent(idx);
                }
            });
        }
    })

    //timer
    const deadline = "2024-07-19";

    function getTimeRemaining(endTime) {
        const t = Date.parse(endTime) - new Date(), days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor(t / (1000 * 60 * 60) % 24), minutes = Math.floor((t / 1000 / 60) % 60),
            seconds = Math.floor((t / 1000) % 60);

        return {
            "total": t, "days": days, "hours": hours, "minutes": minutes, "seconds": seconds
        };
    }

    function getZeroNumString(num) {
        if (num >= 0 && num < 10) {
            return `0${num}`;
        }
        return num;
    }

    function setClock(selector, endTime) {
        const timer = document.querySelector(selector);
        const days = timer.querySelector("#days");
        const hours = timer.querySelector("#hours");
        const minutes = timer.querySelector("#minutes");
        const seconds = timer.querySelector("#seconds");

        let timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const t = getTimeRemaining(endTime);

            if (t.total > 0) {
                days.textContent = getZeroNumString(t.days);
                hours.textContent = getZeroNumString(t.hours)
                minutes.textContent = getZeroNumString(t.minutes);
                seconds.textContent = getZeroNumString(t.seconds);
            } else {
                clearInterval(timeInterval);
                days.textContent = "0";
                hours.textContent = "0";
                minutes.textContent = "0";
                seconds.textContent = "0";
            }
        }
    }

    setClock(".timer", deadline)

    //Modal
    const modalOpen = document.querySelectorAll("[data-modal]");
    const modal = document.querySelector(".modal");
    const modalContent = document.querySelector(".modal__content");

    function showModal() {
        modal.classList.add("show");
        modal.classList.remove("hide");
        document.body.style.overflow = "hidden";
        clearInterval(modalTimerId);
    }

    function hideModal() {
        modal.classList.add("hide");
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }

    modalOpen.forEach((item) => {
        item.addEventListener("click", () => {
            showModal();
        })
    })

    modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.getAttribute("data-close") === "") {
            hideModal(modal);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.code === "Escape" && modal.classList.contains("show")) {
            hideModal(modal);
        }
    })

    const modalTimerId = setTimeout(showModal, 50000);

    const showModalByScroll = () => {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 1) {
            showModal();
            window.removeEventListener("scroll", showModalByScroll)
        }
    }
    window.addEventListener("scroll", showModalByScroll);

    //Cards
    class MenuCard {
        constructor(title, description, cost, imageUrl, imageAlt, parentSelector, ...classes) {
            this.title = title;
            this.description = description;
            this.cost = cost;
            this.imageUrl = imageUrl;
            this.imageAlt = imageAlt;
            this.classes = classes;
            this.transfer = 100;
            this.parent = document.querySelector(parentSelector)
            this.changeToRubles();
        }

        changeToRubles() {
            this.cost = this.cost * this.transfer;
        }

        render() {
            const menuItemDiv = document.createElement("div");
            if (this.classes.length === 0) {
                menuItemDiv.classList.add("menu__item");
            } else {
                this.classes.forEach(className => menuItemDiv.classList.add(className));
            }
            menuItemDiv.innerHTML = `<img src="${this.imageUrl}" alt="${this.imageAlt}">
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.description}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.cost}</span> руб/день</div>
                </div>`;
            this.parent.append(menuItemDiv);
        }
    }


    const cardsContainerSelector = ".menu .container";

    const getResource = async (url) => {
        let res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }
        return await res.json();
    };


    /*getResource("http://localhost:3000/menu")
        .then(data => {
            debugger;
            data.forEach(({title, descr, price, img, altimg}) => {
                debugger;
                new MenuCard(title, descr, price, img, altimg, cardsContainerSelector, "menu__item", "big").render();
            })
        });*/
    axios.get("http://localhost:3000/menu")
        .then(response => {
            debugger;
            response.data.forEach(({title, descr, price, img, altimg}) => {
                debugger;
                new MenuCard(title, descr, price, img, altimg, cardsContainerSelector, "menu__item", "big").render();
            })
        });


    //Forms
    const forms = document.querySelectorAll("form");

    const message = {
        loading: "img/form/spinner.svg", success: "Скоро мы с Вами свяжемся", failure: "Что-то пошло не так"
    }

    forms.forEach(item => bindPostData(item));

    const postData = async (url, data) => {
        let res = await fetch(url, {
            method: "POST", headers: {
                'Content-Type': 'application/json'
            }, body: data
        });

        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            let statusMessage = document.createElement("img");
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
                align-self:center;            `
            form.insertAdjacentElement("afterend", statusMessage)

            const formData = new FormData(form);
            const json = JSON.stringify(Object.fromEntries(formData.entries()))
            console.log("Request " + json);

            postData('http://localhost:3000/requests', json)
                .then(data => {
                    console.log(data);
                    showThanksModal(message.success);
                    statusMessage.remove();
                }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() => {
                form.reset();
            });
        });
    }

    //Thanks modal
    function showThanksModal(message) {
        let prevModalDialog = document.querySelector(".modal__dialog");

        prevModalDialog.classList.add("hide")
        prevModalDialog.classList.remove("show")

        showModal()

        let thanksModal = document.createElement("div")
        thanksModal.classList.add("modal__dialog")
        thanksModal.innerHTML = `<div class="modal__content">
                <div data-close class="modal__close">&times;</div>
                <div class="modal__title">${message}</div>
            </div>`

        modal.append(thanksModal)
        setTimeout(() => {
            thanksModal.remove()
            prevModalDialog.classList.add("show")
            prevModalDialog.classList.remove("hide")
            hideModal()
        }, 4000)
    }


    //Slides

    const slides = document.querySelectorAll(".offer__slide");
    let numSlides = slides.length;
    const slideCounter = document.querySelector(".offer__slider-counter");
    const current = slideCounter.querySelector("#current");
    const total = slideCounter.querySelector("#total");
    const prev = slideCounter.querySelector(".offer__slider-prev");
    const next = slideCounter.querySelector(".offer__slider-next");
    const slidesWrapper = document.querySelector(".offer__slider-wrapper");
    const slidesField = document.querySelector(".offer__slider-inner");
    const width = window.getComputedStyle(slidesWrapper).width;
    let slideIndex = 1;
    let offset = 0;

    showSlideIndex();

    slidesField.style.width = 100 * slides.length + "%";
    slidesField.style.display = "flex";
    slidesField.style.transition = "0.5s all"

    slidesWrapper.style.overflow = "hidden";

    slides.forEach(slide => {
        slide.style.width = width;
    })

    //to the left
    next.addEventListener("click", () => {
        if (offset === +width.slice(0, width.length - 2) * (slides.length - 1)) {//500px
            offset = 0;
        } else {
            offset += +width.slice(0, width.length - 2);
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex === slides.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }
        showSlideIndex();

    })

    //to the right
    prev.addEventListener("click", () => {
        if (offset === 0) {//500px
            offset = +width.slice(0, width.length - 2) * (slides.length - 1)
        } else {
            offset -= +width.slice(0, width.length - 2);
        }

        slidesField.style.transform = `translateX(-${offset}px)`;
        if (slideIndex === 1) {
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }
        showSlideIndex();

    })

    function showSlideIndex() {
        current.innerText = getZeroNumString(slideIndex);
        total.innerText = getZeroNumString(numSlides);
    }

    /*showSlides();

    prev.addEventListener("click", () => {
        if (slideIndex > 0) {
            slideIndex--;
        } else {
            slideIndex = numSlides - 1;
        }
        showSlides();
    })

    next.addEventListener("click", () => {
        if (slideIndex < numSlides - 1) {
            slideIndex++;
        } else {
            slideIndex = 0;
        }
        showSlides();
    })

    function showSlides() {
        slides.forEach(item => {
            item.classList.add("hide");
            item.classList.remove("show");
        });

        current.innerText = getZeroNumString(slideIndex + 1);
        total.innerText = getZeroNumString(numSlides);

        slides[slideIndex].classList.add("show");
        slides[slideIndex].classList.remove("hide");
    }*/

});