/*! ===================================================
 * bootstrap-transition.js v2.3.2
 * http://twitter.github.com/bootstrap/javascript.html#transitions
 * ===================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
! function($) {
    $(function() {
        $.support.transition = (function() {
            var transitionEnd = (function() {
                var el = document.createElement("bootstrap"),
                    transEndEventNames = {
                        WebkitTransition: "webkitTransitionEnd",
                        MozTransition: "transitionend",
                        OTransition: "oTransitionEnd otransitionend",
                        transition: "transitionend"
                    },
                    name;
                for (name in transEndEventNames) {
                    if (el.style[name] !== undefined) {
                        return transEndEventNames[name]
                    }
                }
            }());
            return transitionEnd && {
                end: transitionEnd
            }
        })()
    })
}(window.jQuery);
! function($) {
    var dismiss = '[data-dismiss="alert"]',
        Alert = function(el) {
            $(el).on("click", dismiss, this.close)
        };
    Alert.prototype.close = function(e) {
        var $this = $(this),
            selector = $this.attr("data-target"),
            $parent;
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, "")
        }
        $parent = $(selector);
        e && e.preventDefault();
        $parent.length || ($parent = $this.hasClass("alert") ? $this : $this.parent());
        $parent.trigger(e = $.Event("close"));
        if (e.isDefaultPrevented()) {
            return
        }
        $parent.removeClass("in");

        function removeElement() {
            $parent.trigger("closed").remove()
        }
        $.support.transition && $parent.hasClass("fade") ? $parent.on($.support.transition.end, removeElement) : removeElement()
    };
    var old = $.fn.alert;
    $.fn.alert = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("alert");
            if (!data) {
                $this.data("alert", (data = new Alert(this)))
            }
            if (typeof option == "string") {
                data[option].call($this)
            }
        })
    };
    $.fn.alert.Constructor = Alert;
    $.fn.alert.noConflict = function() {
        $.fn.alert = old;
        return this
    };
    $(document).on("click.alert.data-api", dismiss, Alert.prototype.close)
}(window.jQuery);
! function($) {
    var Button = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.button.defaults, options)
    };
    Button.prototype.setState = function(state) {
        var d = "disabled",
            $el = this.$element,
            data = $el.data(),
            val = $el.is("input") ? "val" : "html";
        state = state + "Text";
        data.resetText || $el.data("resetText", $el[val]());
        $el[val](data[state] || this.options[state]);
        setTimeout(function() {
            state == "loadingText" ? $el.addClass(d).attr(d, d) : $el.removeClass(d).removeAttr(d)
        }, 0)
    };
    Button.prototype.toggle = function() {
        var $parent = this.$element.closest('[data-toggle="buttons-radio"]');
        $parent && $parent.find(".active").removeClass("active");
        this.$element.toggleClass("active")
    };
    var old = $.fn.button;
    $.fn.button = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("button"),
                options = typeof option == "object" && option;
            if (!data) {
                $this.data("button", (data = new Button(this, options)))
            }
            if (option == "toggle") {
                data.toggle()
            } else {
                if (option) {
                    data.setState(option)
                }
            }
        })
    };
    $.fn.button.defaults = {
        loadingText: "loading..."
    };
    $.fn.button.Constructor = Button;
    $.fn.button.noConflict = function() {
        $.fn.button = old;
        return this
    };
    $(document).on("click.button.data-api", "[data-toggle^=button]", function(e) {
        var $btn = $(e.target);
        if (!$btn.hasClass("btn")) {
            $btn = $btn.closest(".btn")
        }
        $btn.button("toggle")
    })
}(window.jQuery);
! function($) {
    var Carousel = function(element, options) {
        this.$element = $(element);
        this.$indicators = this.$element.find(".carousel-indicators");
        this.options = options;
        this.options.pause == "hover" && this.$element.on("mouseenter", $.proxy(this.pause, this)).on("mouseleave", $.proxy(this.cycle, this))
    };
    Carousel.prototype = {
        cycle: function(e) {
            if (!e) {
                this.paused = false
            }
            if (this.interval) {
                clearInterval(this.interval)
            }
            this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));
            return this
        },
        getActiveIndex: function() {
            this.$active = this.$element.find(".item.active");
            this.$items = this.$active.parent().children();
            return this.$items.index(this.$active)
        },
        to: function(pos) {
            var activeIndex = this.getActiveIndex(),
                that = this;
            if (pos > (this.$items.length - 1) || pos < 0) {
                return
            }
            if (this.sliding) {
                return this.$element.one("slid", function() {
                    that.to(pos)
                })
            }
            if (activeIndex == pos) {
                return this.pause().cycle()
            }
            return this.slide(pos > activeIndex ? "next" : "prev", $(this.$items[pos]))
        },
        pause: function(e) {
            if (!e) {
                this.paused = true
            }
            if (this.$element.find(".next, .prev").length && $.support.transition.end) {
                this.$element.trigger($.support.transition.end);
                this.cycle(true)
            }
            clearInterval(this.interval);
            this.interval = null;
            return this
        },
        next: function() {
            if (this.sliding) {
                return
            }
            return this.slide("next")
        },
        prev: function() {
            if (this.sliding) {
                return
            }
            return this.slide("prev")
        },
        slide: function(type, next) {
            var $active = this.$element.find(".item.active"),
                $next = next || $active[type](),
                isCycling = this.interval,
                direction = type == "next" ? "left" : "right",
                fallback = type == "next" ? "first" : "last",
                that = this,
                e;
            this.sliding = true;
            isCycling && this.pause();
            $next = $next.length ? $next : this.$element.find(".item")[fallback]();
            e = $.Event("slide", {
                relatedTarget: $next[0],
                direction: direction
            });
            if ($next.hasClass("active")) {
                return
            }
            if (this.$indicators.length) {
                this.$indicators.find(".active").removeClass("active");
                this.$element.one("slid", function() {
                    var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()]);
                    $nextIndicator && $nextIndicator.addClass("active")
                })
            }
            if ($.support.transition && this.$element.hasClass("slide")) {
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) {
                    return
                }
                $next.addClass(type);
                $next[0].offsetWidth;
                $active.addClass(direction);
                $next.addClass(direction);
                this.$element.one($.support.transition.end, function() {
                    $next.removeClass([type, direction].join(" ")).addClass("active");
                    $active.removeClass(["active", direction].join(" "));
                    that.sliding = false;
                    setTimeout(function() {
                        that.$element.trigger("slid")
                    }, 0)
                })
            } else {
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) {
                    return
                }
                $active.removeClass("active");
                $next.addClass("active");
                this.sliding = false;
                this.$element.trigger("slid")
            }
            isCycling && this.cycle();
            return this
        }
    };
    var old = $.fn.carousel;
    $.fn.carousel = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("carousel"),
                options = $.extend({}, $.fn.carousel.defaults, typeof option == "object" && option),
                action = typeof option == "string" ? option : options.slide;
            if (!data) {
                $this.data("carousel", (data = new Carousel(this, options)))
            }
            if (typeof option == "number") {
                data.to(option)
            } else {
                if (action) {
                    data[action]()
                } else {
                    if (options.interval) {
                        data.pause().cycle()
                    }
                }
            }
        })
    };
    $.fn.carousel.defaults = {
        interval: 5000,
        pause: "hover"
    };
    $.fn.carousel.Constructor = Carousel;
    $.fn.carousel.noConflict = function() {
        $.fn.carousel = old;
        return this
    };
    $(document).on("click.carousel.data-api", "[data-slide], [data-slide-to]", function(e) {
        var $this = $(this),
            href, $target = $($this.attr("data-target") || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "")),
            options = $.extend({}, $target.data(), $this.data()),
            slideIndex;
        $target.carousel(options);
        if (slideIndex = $this.attr("data-slide-to")) {
            $target.data("carousel").pause().to(slideIndex).cycle()
        }
        e.preventDefault()
    })
}(window.jQuery);
! function($) {
    var Collapse = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.collapse.defaults, options);
        if (this.options.parent) {
            this.$parent = $(this.options.parent)
        }
        this.options.toggle && this.toggle()
    };
    Collapse.prototype = {
        constructor: Collapse,
        dimension: function() {
            var hasWidth = this.$element.hasClass("width");
            return hasWidth ? "width" : "height"
        },
        show: function() {
            var dimension, scroll, actives, hasData;
            if (this.transitioning || this.$element.hasClass("in")) {
                return
            }
            dimension = this.dimension();
            scroll = $.camelCase(["scroll", dimension].join("-"));
            actives = this.$parent && this.$parent.find("> .accordion-group > .in");
            if (actives && actives.length) {
                hasData = actives.data("collapse");
                if (hasData && hasData.transitioning) {
                    return
                }
                actives.collapse("hide");
                hasData || actives.data("collapse", null)
            }
            this.$element[dimension](0);
            this.transition("addClass", $.Event("show"), "shown");
            $.support.transition && this.$element[dimension](this.$element[0][scroll])
        },
        hide: function() {
            var dimension;
            if (this.transitioning || !this.$element.hasClass("in")) {
                return
            }
            dimension = this.dimension();
            this.reset(this.$element[dimension]());
            this.transition("removeClass", $.Event("hide"), "hidden");
            this.$element[dimension](0)
        },
        reset: function(size) {
            var dimension = this.dimension();
            this.$element.removeClass("collapse")[dimension](size || "auto")[0].offsetWidth;
            this.$element[size !== null ? "addClass" : "removeClass"]("collapse");
            return this
        },
        transition: function(method, startEvent, completeEvent) {
            var that = this,
                complete = function() {
                    if (startEvent.type == "show") {
                        that.reset()
                    }
                    that.transitioning = 0;
                    that.$element.trigger(completeEvent)
                };
            this.$element.trigger(startEvent);
            if (startEvent.isDefaultPrevented()) {
                return
            }
            this.transitioning = 1;
            this.$element[method]("in");
            $.support.transition && this.$element.hasClass("collapse") ? this.$element.one($.support.transition.end, complete) : complete()
        },
        toggle: function() {
            this[this.$element.hasClass("in") ? "hide" : "show"]()
        }
    };
    var old = $.fn.collapse;
    $.fn.collapse = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("collapse"),
                options = $.extend({}, $.fn.collapse.defaults, $this.data(), typeof option == "object" && option);
            if (!data) {
                $this.data("collapse", (data = new Collapse(this, options)))
            }
            if (typeof option == "string") {
                data[option]()
            }
        })
    };
    $.fn.collapse.defaults = {
        toggle: true
    };
    $.fn.collapse.Constructor = Collapse;
    $.fn.collapse.noConflict = function() {
        $.fn.collapse = old;
        return this
    };
    $(document).on("click.collapse.data-api", "[data-toggle=collapse]", function(e) {
        var $this = $(this),
            href, target = $this.attr("data-target") || e.preventDefault() || (href = $this.attr("href")) && href.replace(/.*(?=#[^\s]+$)/, ""),
            option = $(target).data("collapse") ? "toggle" : $this.data();
        $this[$(target).hasClass("in") ? "addClass" : "removeClass"]("collapsed");
        $(target).collapse(option)
    })
}(window.jQuery);
! function($) {
    var toggle = "[data-toggle=dropdown]",
        Dropdown = function(element) {
            var $el = $(element).on("click.dropdown.data-api", this.toggle);
            $("html").on("click.dropdown.data-api", function() {
                $el.parent().removeClass("open")
            })
        };
    Dropdown.prototype = {
        constructor: Dropdown,
        toggle: function(e) {
            var $this = $(this),
                $parent, isActive;
            if ($this.is(".disabled, :disabled")) {
                return
            }
            $parent = getParent($this);
            isActive = $parent.hasClass("open");
            clearMenus();
            if (!isActive) {
                if ("ontouchstart" in document.documentElement) {}
                $parent.toggleClass("open")
            }
            $this.blur();
            return false
        },
        keydown: function(e) {
            var $this, $items, $active, $parent, isActive, index;
            if (!/(38|40|27)/.test(e.keyCode)) {
                return
            }
            $this = $(this);
            e.preventDefault();
            e.stopPropagation();
            if ($this.is(".disabled, :disabled")) {
                return
            }
            $parent = getParent($this);
            isActive = $parent.hasClass("open");
            if (!isActive || (isActive && e.keyCode == 27)) {
                if (e.which == 27) {
                    $parent.find(toggle).focus()
                }
                return $this.click()
            }
            $items = $("[role=menu] li:not(.divider):visible a", $parent);
            if (!$items.length) {
                return
            }
            index = $items.index($items.filter(":focus"));
            if (e.keyCode == 38 && index > 0) {
                index--
            }
            if (e.keyCode == 40 && index < $items.length - 1) {
                index++
            }
            if (!~index) {
                index = 0
            }
            $items.eq(index).focus()
        }
    };

    function clearMenus() {
        $(".dropdown-backdrop").remove();
        $(this).blur();
        $(toggle).each(function() {
            getParent($(this)).removeClass("open")
        })
    }

    function getParent($this) {
        var selector = $this.attr("data-target"),
            $parent;
        if (!selector) {
            selector = $this.attr("href");
            selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, "")
        }
        $parent = selector && $(selector);
        if (!$parent || !$parent.length) {
            $parent = $this.parent()
        }
        return $parent
    }
    var old = $.fn.dropdown;
    $.fn.dropdown = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("dropdown");
            if (!data) {
                $this.data("dropdown", (data = new Dropdown(this)))
            }
            if (typeof option == "string") {
                data[option].call($this)
            }
        })
    };
    $.fn.dropdown.Constructor = Dropdown;
    $.fn.dropdown.noConflict = function() {
        $.fn.dropdown = old;
        return this
    };
    $(document).on("click.dropdown.data-api", clearMenus).on("click.dropdown.data-api", ".dropdown form", function(e) {
        e.stopPropagation()
    }).on("click.dropdown.data-api", toggle, Dropdown.prototype.toggle).on("keydown.dropdown.data-api", toggle + ", [role=menu]", Dropdown.prototype.keydown)
}(window.jQuery);
! function($) {
    var Modal = function(element, options) {
        this.options = options;
        this.$element = $(element).delegate('[data-dismiss="modal"]', "click.dismiss.modal", $.proxy(this.hide, this));
        this.options.remote && this.$element.find(".modal-body").load(this.options.remote)
    };
    Modal.prototype = {
        constructor: Modal,
        toggle: function() {
            return this[!this.isShown ? "show" : "hide"]()
        },
        show: function() {
            var that = this,
                e = $.Event("show");
            this.$element.trigger(e);
            if (this.isShown || e.isDefaultPrevented()) {
                return
            }
            this.isShown = true;
            this.escape();
            this.backdrop(function() {
                var transition = $.support.transition && that.$element.hasClass("fade");
                if (!that.$element.parent().length) {
                    that.$element.appendTo(document.body)
                }
                that.$element.show();
                if (transition) {
                    that.$element[0].offsetWidth
                }
                that.$element.addClass("in").attr("aria-hidden", false);
                that.enforceFocus();
                transition ? that.$element.one($.support.transition.end, function() {
                    that.$element.focus().trigger("shown")
                }) : that.$element.focus().trigger("shown")
            })
        },
        hide: function(e) {
            e && e.preventDefault();
            var that = this;
            e = $.Event("hide");
            this.$element.trigger(e);
            if (!this.isShown || e.isDefaultPrevented()) {
                return
            }
            this.isShown = false;
            this.escape();
            $(document).off("focusin.modal");
            this.$element.removeClass("in").attr("aria-hidden", true);
            $.support.transition && this.$element.hasClass("fade") ? this.hideWithTransition() : this.hideModal()
        },
        enforceFocus: function() {
            var that = this;
            $(document).on("focusin.modal", function(e) {
                if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
                    that.$element.focus()
                }
            })
        },
        escape: function() {
            var that = this;
            if (this.isShown && this.options.keyboard) {
                this.$element.on("keyup.dismiss.modal", function(e) {
                    e.which == 27 && that.hide()
                })
            } else {
                if (!this.isShown) {
                    this.$element.off("keyup.dismiss.modal")
                }
            }
        },
        hideWithTransition: function() {
            var that = this,
                timeout = setTimeout(function() {
                    that.$element.off($.support.transition.end);
                    that.hideModal()
                }, 500);
            this.$element.one($.support.transition.end, function() {
                clearTimeout(timeout);
                that.hideModal()
            })
        },
        hideModal: function() {
            var that = this;
            this.$element.hide();
            this.backdrop(function() {
                that.removeBackdrop();
                that.$element.trigger("hidden")
            })
        },
        removeBackdrop: function() {
            this.$backdrop && this.$backdrop.remove();
            this.$backdrop = null
        },
        backdrop: function(callback) {
            var that = this,
                animate = this.$element.hasClass("fade") ? "fade" : "";
            if (this.isShown && this.options.backdrop) {
                var doAnimate = $.support.transition && animate;
                this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />').appendTo(document.body);
                this.$backdrop.click(this.options.backdrop == "static" ? $.proxy(this.$element[0].focus, this.$element[0]) : $.proxy(this.hide, this));
                if (doAnimate) {
                    this.$backdrop[0].offsetWidth
                }
                this.$backdrop.addClass("in");
                if (!callback) {
                    return
                }
                doAnimate ? this.$backdrop.one($.support.transition.end, callback) : callback()
            } else {
                if (!this.isShown && this.$backdrop) {
                    this.$backdrop.removeClass("in");
                    $.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one($.support.transition.end, callback) : callback()
                } else {
                    if (callback) {
                        callback()
                    }
                }
            }
        }
    };
    var old = $.fn.modal;
    $.fn.modal = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("modal"),
                options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == "object" && option);
            if (!data) {
                $this.data("modal", (data = new Modal(this, options)))
            }
            if (typeof option == "string") {
                data[option]()
            } else {
                if (options.show) {
                    data.show()
                }
            }
        })
    };
    $.fn.modal.defaults = {
        backdrop: true,
        keyboard: true,
        show: true
    };
    $.fn.modal.Constructor = Modal;
    $.fn.modal.noConflict = function() {
        $.fn.modal = old;
        return this
    };
    $(document).on("click.modal.data-api", '[data-toggle="modal"]', function(e) {
        var $this = $(this),
            href = $this.attr("href"),
            $target = $($this.attr("data-target") || (href && href.replace(/.*(?=#[^\s]+$)/, ""))),
            option = $target.data("modal") ? "toggle" : $.extend({
                remote: !/#/.test(href) && href
            }, $target.data(), $this.data());
        e.preventDefault();
        $target.modal(option).one("hide", function() {
            $this.focus()
        })
    })
}(window.jQuery);
! function($) {
    var Tooltip = function(element, options) {
        this.init("tooltip", element, options)
    };
    Tooltip.prototype = {
        constructor: Tooltip,
        init: function(type, element, options) {
            var eventIn, eventOut, triggers, trigger, i;
            this.type = type;
            this.$element = $(element);
            this.options = this.getOptions(options);
            this.enabled = true;
            triggers = this.options.trigger.split(" ");
            for (i = triggers.length; i--;) {
                trigger = triggers[i];
                if (trigger == "click") {
                    this.$element.on("click." + this.type, this.options.selector, $.proxy(this.toggle, this))
                } else {
                    if (trigger != "manual") {
                        eventIn = trigger == "hover" ? "mouseenter" : "focus";
                        eventOut = trigger == "hover" ? "mouseleave" : "blur";
                        this.$element.on(eventIn + "." + this.type, this.options.selector, $.proxy(this.enter, this));
                        this.$element.on(eventOut + "." + this.type, this.options.selector, $.proxy(this.leave, this))
                    }
                }
            }
            this.options.selector ? (this._options = $.extend({}, this.options, {
                trigger: "manual",
                selector: ""
            })) : this.fixTitle()
        },
        getOptions: function(options) {
            options = $.extend({}, $.fn[this.type].defaults, this.$element.data(), options);
            if (options.delay && typeof options.delay == "number") {
                options.delay = {
                    show: options.delay,
                    hide: options.delay
                }
            }
            return options
        },
        enter: function(e) {
            var defaults = $.fn[this.type].defaults,
                options = {},
                self;
            this._options && $.each(this._options, function(key, value) {
                if (defaults[key] != value) {
                    options[key] = value
                }
            }, this);
            self = $(e.currentTarget)[this.type](options).data(this.type);
            if (!self.options.delay || !self.options.delay.show) {
                return self.show()
            }
            clearTimeout(this.timeout);
            self.hoverState = "in";
            this.timeout = setTimeout(function() {
                if (self.hoverState == "in") {
                    self.show()
                }
            }, self.options.delay.show)
        },
        leave: function(e) {
            var self = $(e.currentTarget)[this.type](this._options).data(this.type);
            if (this.timeout) {
                clearTimeout(this.timeout)
            }
            if (!self.options.delay || !self.options.delay.hide) {
                return self.hide()
            }
            self.hoverState = "out";
            this.timeout = setTimeout(function() {
                if (self.hoverState == "out") {
                    self.hide()
                }
            }, self.options.delay.hide)
        },
        show: function() {
            var $tip, pos, actualWidth, actualHeight, placement, tp, e = $.Event("show");
            if (this.hasContent() && this.enabled) {
                this.$element.trigger(e);
                if (e.isDefaultPrevented()) {
                    return
                }
                $tip = this.tip();
                this.setContent();
                if (this.options.animation) {
                    $tip.addClass("fade")
                }
                placement = typeof this.options.placement == "function" ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;
                $tip.detach().css({
                    top: 0,
                    left: 0,
                    display: "block"
                });
                this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
                pos = this.getPosition();
                actualWidth = $tip[0].offsetWidth;
                actualHeight = $tip[0].offsetHeight;
                switch (placement) {
                    case "bottom":
                        tp = {
                            top: pos.top + pos.height,
                            left: pos.left + pos.width / 2 - actualWidth / 2
                        };
                        break;
                    case "top":
                        tp = {
                            top: pos.top - actualHeight,
                            left: pos.left + pos.width / 2 - actualWidth / 2
                        };
                        break;
                    case "left":
                        tp = {
                            top: pos.top + pos.height / 2 - actualHeight / 2,
                            left: pos.left - actualWidth
                        };
                        break;
                    case "right":
                        tp = {
                            top: pos.top + pos.height / 2 - actualHeight / 2,
                            left: pos.left + pos.width
                        };
                        break
                }
                this.applyPlacement(tp, placement);
                this.$element.trigger("shown")
            }
        },
        applyPlacement: function(offset, placement) {
            var $tip = this.tip(),
                width = $tip[0].offsetWidth,
                height = $tip[0].offsetHeight,
                actualWidth, actualHeight, delta, replace;
            $tip.offset(offset).addClass(placement).addClass("in");
            actualWidth = $tip[0].offsetWidth;
            actualHeight = $tip[0].offsetHeight;
            if (placement == "top" && actualHeight != height) {
                offset.top = offset.top + height - actualHeight;
                replace = true
            }
            if (placement == "bottom" || placement == "top") {
                delta = 0;
                if (offset.left < 0) {
                    delta = offset.left * -2;
                    offset.left = 0;
                    $tip.offset(offset);
                    actualWidth = $tip[0].offsetWidth;
                    actualHeight = $tip[0].offsetHeight
                }
                this.replaceArrow(delta - width + actualWidth, actualWidth, "left")
            } else {
                this.replaceArrow(actualHeight - height, actualHeight, "top")
            }
            if (replace) {
                $tip.offset(offset)
            }
        },
        replaceArrow: function(delta, dimension, position) {
            this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : "")
        },
        setContent: function() {
            var $tip = this.tip(),
                title = this.getTitle();
            $tip.find(".tooltip-inner")[this.options.html ? "html" : "text"](title);
            $tip.removeClass("fade in top bottom left right")
        },
        hide: function() {
            var that = this,
                $tip = this.tip(),
                e = $.Event("hide");
            this.$element.trigger(e);
            if (e.isDefaultPrevented()) {
                return
            }
            $tip.removeClass("in");

            function removeWithAnimation() {
                var timeout = setTimeout(function() {
                    $tip.off($.support.transition.end).detach()
                }, 500);
                $tip.one($.support.transition.end, function() {
                    clearTimeout(timeout);
                    $tip.detach()
                })
            }
            $.support.transition && this.$tip.hasClass("fade") ? removeWithAnimation() : $tip.detach();
            this.$element.trigger("hidden");
            return this
        },
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr("title") || typeof($e.attr("data-original-title")) != "string") {
                $e.attr("data-original-title", $e.attr("title") || "").attr("title", "")
            }
        },
        hasContent: function() {
            return this.getTitle()
        },
        getPosition: function() {
            var el = this.$element[0];
            return $.extend({}, (typeof el.getBoundingClientRect == "function") ? el.getBoundingClientRect() : {
                width: el.offsetWidth,
                height: el.offsetHeight
            }, this.$element.offset())
        },
        getTitle: function() {
            var title, $e = this.$element,
                o = this.options;
            title = $e.attr("data-original-title") || (typeof o.title == "function" ? o.title.call($e[0]) : o.title);
            return title
        },
        tip: function() {
            return this.$tip = this.$tip || $(this.options.template)
        },
        arrow: function() {
            return this.$arrow = this.$arrow || this.tip().find(".tooltip-arrow")
        },
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null
            }
        },
        enable: function() {
            this.enabled = true
        },
        disable: function() {
            this.enabled = false
        },
        toggleEnabled: function() {
            this.enabled = !this.enabled
        },
        toggle: function(e) {
            var self = e ? $(e.currentTarget)[this.type](this._options).data(this.type) : this;
            self.tip().hasClass("in") ? self.hide() : self.show()
        },
        destroy: function() {
            this.hide().$element.off("." + this.type).removeData(this.type)
        }
    };
    var old = $.fn.tooltip;
    $.fn.tooltip = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("tooltip"),
                options = typeof option == "object" && option;
            if (!data) {
                $this.data("tooltip", (data = new Tooltip(this, options)))
            }
            if (typeof option == "string") {
                data[option]()
            }
        })
    };
    $.fn.tooltip.Constructor = Tooltip;
    $.fn.tooltip.defaults = {
        animation: true,
        placement: "top",
        selector: false,
        template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
        trigger: "hover focus",
        title: "",
        delay: 0,
        html: false,
        container: false
    };
    $.fn.tooltip.noConflict = function() {
        $.fn.tooltip = old;
        return this
    }
}(window.jQuery);
! function($) {
    var Popover = function(element, options) {
        this.init("popover", element, options)
    };
    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {
        constructor: Popover,
        setContent: function() {
            var $tip = this.tip(),
                title = this.getTitle(),
                content = this.getContent();
            $tip.find(".popover-title")[this.options.html ? "html" : "text"](title);
            $tip.find(".popover-content")[this.options.html ? "html" : "text"](content);
            $tip.removeClass("fade top bottom left right in")
        },
        hasContent: function() {
            return this.getTitle() || this.getContent()
        },
        getContent: function() {
            var content, $e = this.$element,
                o = this.options;
            content = (typeof o.content == "function" ? o.content.call($e[0]) : o.content) || $e.attr("data-content");
            return content
        },
        tip: function() {
            if (!this.$tip) {
                this.$tip = $(this.options.template)
            }
            return this.$tip
        },
        destroy: function() {
            this.hide().$element.off("." + this.type).removeData(this.type)
        }
    });
    var old = $.fn.popover;
    $.fn.popover = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("popover"),
                options = typeof option == "object" && option;
            if (!data) {
                $this.data("popover", (data = new Popover(this, options)))
            }
            if (typeof option == "string") {
                data[option]()
            }
        })
    };
    $.fn.popover.Constructor = Popover;
    $.fn.popover.defaults = $.extend({}, $.fn.tooltip.defaults, {
        placement: "right",
        trigger: "click",
        content: "",
        template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    });
    $.fn.popover.noConflict = function() {
        $.fn.popover = old;
        return this
    }
}(window.jQuery);
! function($) {
    function ScrollSpy(element, options) {
        var process = $.proxy(this.process, this),
            $element = $(element).is("body") ? $(window) : $(element),
            href;
        this.options = $.extend({}, $.fn.scrollspy.defaults, options);
        this.$scrollElement = $element.on("scroll.scroll-spy.data-api", process);
        this.selector = (this.options.target || ((href = $(element).attr("href")) && href.replace(/.*(?=#[^\s]+$)/, "")) || "") + " .nav li > a";
        this.$body = $("body");
        this.refresh();
        this.process()
    }
    ScrollSpy.prototype = {
        constructor: ScrollSpy,
        refresh: function() {
            var self = this,
                $targets;
            this.offsets = $([]);
            this.targets = $([]);
            $targets = this.$body.find(this.selector).map(function() {
                var $el = $(this),
                    href = $el.data("target") || $el.attr("href"),
                    $href = /^#\w/.test(href) && $(href);
                return ($href && $href.length && [
                    [$href.position().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href]
                ]) || null
            }).sort(function(a, b) {
                return a[0] - b[0]
            }).each(function() {
                self.offsets.push(this[0]);
                self.targets.push(this[1])
            })
        },
        process: function() {
            var scrollTop = this.$scrollElement.scrollTop() + this.options.offset,
                scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight,
                maxScroll = scrollHeight - this.$scrollElement.height(),
                offsets = this.offsets,
                targets = this.targets,
                activeTarget = this.activeTarget,
                i;
            if (scrollTop >= maxScroll) {
                return activeTarget != (i = targets.last()[0]) && this.activate(i)
            }
            for (i = offsets.length; i--;) {
                activeTarget != targets[i] && scrollTop >= offsets[i] && (!offsets[i + 1] || scrollTop <= offsets[i + 1]) && this.activate(targets[i])
            }
        },
        activate: function(target) {
            var active, selector;
            this.activeTarget = target;
            $(this.selector).parent(".active").removeClass("active");
            selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';
            active = $(selector).parent("li").addClass("active");
            if (active.parent(".dropdown-menu").length) {
                active = active.closest("li.dropdown").addClass("active")
            }
            active.trigger("activate")
        }
    };
    var old = $.fn.scrollspy;
    $.fn.scrollspy = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("scrollspy"),
                options = typeof option == "object" && option;
            if (!data) {
                $this.data("scrollspy", (data = new ScrollSpy(this, options)))
            }
            if (typeof option == "string") {
                data[option]()
            }
        })
    };
    $.fn.scrollspy.Constructor = ScrollSpy;
    $.fn.scrollspy.defaults = {
        offset: 10
    };
    $.fn.scrollspy.noConflict = function() {
        $.fn.scrollspy = old;
        return this
    };
    $(window).on("load", function() {
        $('[data-spy="scroll"]').each(function() {
            var $spy = $(this);
            $spy.scrollspy($spy.data())
        })
    })
}(window.jQuery);
! function($) {
    var Tab = function(element) {
        this.element = $(element)
    };
    Tab.prototype = {
        constructor: Tab,
        show: function() {
            var $this = this.element,
                $ul = $this.closest("ul:not(.dropdown-menu)"),
                selector = $this.attr("data-target"),
                previous, $target, e;
            if (!selector) {
                selector = $this.attr("href");
                selector = selector && selector.replace(/.*(?=#[^\s]*$)/, "")
            }
            if ($this.parent("li").hasClass("active")) {
                return
            }
            previous = $ul.find(".active:last a")[0];
            e = $.Event("show", {
                relatedTarget: previous
            });
            $this.trigger(e);
            if (e.isDefaultPrevented()) {
                return
            }
            $target = $(selector);
            this.activate($this.parent("li"), $ul);
            this.activate($target, $target.parent(), function() {
                $this.trigger({
                    type: "shown",
                    relatedTarget: previous
                })
            })
        },
        activate: function(element, container, callback) {
            var $active = container.find("> .active"),
                transition = callback && $.support.transition && $active.hasClass("fade");

            function next() {
                $active.removeClass("active").find("> .dropdown-menu > .active").removeClass("active");
                element.addClass("active");
                if (transition) {
                    element[0].offsetWidth;
                    element.addClass("in")
                } else {
                    element.removeClass("fade")
                }
                if (element.parent(".dropdown-menu")) {
                    element.closest("li.dropdown").addClass("active")
                }
                callback && callback()
            }
            transition ? $active.one($.support.transition.end, next) : next();
            $active.removeClass("in")
        }
    };
    var old = $.fn.tab;
    $.fn.tab = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("tab");
            if (!data) {
                $this.data("tab", (data = new Tab(this)))
            }
            if (typeof option == "string") {
                data[option]()
            }
        })
    };
    $.fn.tab.Constructor = Tab;
    $.fn.tab.noConflict = function() {
        $.fn.tab = old;
        return this
    };
    $(document).on("click.tab.data-api", '[data-toggle="tab"], [data-toggle="pill"]', function(e) {
        e.preventDefault();
        $(this).tab("show")
    })
}(window.jQuery);
! function($) {
    var Typeahead = function(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.typeahead.defaults, options);
        this.matcher = this.options.matcher || this.matcher;
        this.sorter = this.options.sorter || this.sorter;
        this.highlighter = this.options.highlighter || this.highlighter;
        this.updater = this.options.updater || this.updater;
        this.source = this.options.source;
        this.$menu = $(this.options.menu);
        this.shown = false;
        this.listen()
    };
    Typeahead.prototype = {
        constructor: Typeahead,
        select: function() {
            var val = this.$menu.find(".active").attr("data-value");
            this.$element.val(this.updater(val)).change();
            return this.hide()
        },
        updater: function(item) {
            return item
        },
        show: function() {
            var pos = $.extend({}, this.$element.position(), {
                height: this.$element[0].offsetHeight
            });
            this.$menu.insertAfter(this.$element).css({
                top: pos.top + pos.height,
                left: pos.left
            }).show();
            this.shown = true;
            return this
        },
        hide: function() {
            this.$menu.hide();
            this.shown = false;
            return this
        },
        lookup: function(event) {
            var items;
            this.query = this.$element.val();
            if (!this.query || this.query.length < this.options.minLength) {
                return this.shown ? this.hide() : this
            }
            items = $.isFunction(this.source) ? this.source(this.query, $.proxy(this.process, this)) : this.source;
            return items ? this.process(items) : this
        },
        process: function(items) {
            var that = this;
            items = $.grep(items, function(item) {
                return that.matcher(item)
            });
            items = this.sorter(items);
            if (!items.length) {
                return this.shown ? this.hide() : this
            }
            return this.render(items.slice(0, this.options.items)).show()
        },
        matcher: function(item) {
            return ~item.toLowerCase().indexOf(this.query.toLowerCase())
        },
        sorter: function(items) {
            var beginswith = [],
                caseSensitive = [],
                caseInsensitive = [],
                item;
            while (item = items.shift()) {
                if (!item.toLowerCase().indexOf(this.query.toLowerCase())) {
                    beginswith.push(item)
                } else {
                    if (~item.indexOf(this.query)) {
                        caseSensitive.push(item)
                    } else {
                        caseInsensitive.push(item)
                    }
                }
            }
            return beginswith.concat(caseSensitive, caseInsensitive)
        },
        highlighter: function(item) {
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
            return item.replace(new RegExp("(" + query + ")", "ig"), function($1, match) {
                return "<strong>" + match + "</strong>"
            })
        },
        render: function(items) {
            var that = this;
            items = $(items).map(function(i, item) {
                i = $(that.options.item).attr("data-value", item);
                i.find("a").html(that.highlighter(item));
                return i[0]
            });
            items.first().addClass("active");
            this.$menu.html(items);
            return this
        },
        next: function(event) {
            var active = this.$menu.find(".active").removeClass("active"),
                next = active.next();
            if (!next.length) {
                next = $(this.$menu.find("li")[0])
            }
            next.addClass("active")
        },
        prev: function(event) {
            var active = this.$menu.find(".active").removeClass("active"),
                prev = active.prev();
            if (!prev.length) {
                prev = this.$menu.find("li").last()
            }
            prev.addClass("active")
        },
        listen: function() {
            this.$element.on("focus", $.proxy(this.focus, this)).on("blur", $.proxy(this.blur, this)).on("keypress", $.proxy(this.keypress, this)).on("keyup", $.proxy(this.keyup, this));
            if (this.eventSupported("keydown")) {
                this.$element.on("keydown", $.proxy(this.keydown, this))
            }
            this.$menu.on("click", $.proxy(this.click, this)).on("mouseenter", "li", $.proxy(this.mouseenter, this)).on("mouseleave", "li", $.proxy(this.mouseleave, this))
        },
        eventSupported: function(eventName) {
            var isSupported = eventName in this.$element;
            if (!isSupported) {
                this.$element.setAttribute(eventName, "return;");
                isSupported = typeof this.$element[eventName] === "function"
            }
            return isSupported
        },
        move: function(e) {
            if (!this.shown) {
                return
            }
            switch (e.keyCode) {
                case 9:
                case 13:
                case 27:
                    e.preventDefault();
                    break;
                case 38:
                    e.preventDefault();
                    this.prev();
                    break;
                case 40:
                    e.preventDefault();
                    this.next();
                    break
            }
            e.stopPropagation()
        },
        keydown: function(e) {
            this.suppressKeyPressRepeat = ~$.inArray(e.keyCode, [40, 38, 9, 13, 27]);
            this.move(e)
        },
        keypress: function(e) {
            if (this.suppressKeyPressRepeat) {
                return
            }
            this.move(e)
        },
        keyup: function(e) {
            switch (e.keyCode) {
                case 40:
                case 38:
                case 16:
                case 17:
                case 18:
                    break;
                case 9:
                case 13:
                    if (!this.shown) {
                        return
                    }
                    this.select();
                    break;
                case 27:
                    if (!this.shown) {
                        return
                    }
                    this.hide();
                    break;
                default:
                    this.lookup()
            }
            e.stopPropagation();
            e.preventDefault()
        },
        focus: function(e) {
            this.focused = true
        },
        blur: function(e) {
            this.focused = false;
            if (!this.mousedover && this.shown) {
                this.hide()
            }
        },
        click: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.select();
            this.$element.focus()
        },
        mouseenter: function(e) {
            this.mousedover = true;
            this.$menu.find(".active").removeClass("active");
            $(e.currentTarget).addClass("active")
        },
        mouseleave: function(e) {
            this.mousedover = false;
            if (!this.focused && this.shown) {
                this.hide()
            }
        }
    };
    var old = $.fn.typeahead;
    $.fn.typeahead = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("typeahead"),
                options = typeof option == "object" && option;
            if (!data) {
                $this.data("typeahead", (data = new Typeahead(this, options)))
            }
            if (typeof option == "string") {
                data[option]()
            }
        })
    };
    $.fn.typeahead.defaults = {
        source: [],
        items: 8,
        menu: '<ul class="typeahead dropdown-menu"></ul>',
        item: '<li><a href="#"></a></li>',
        minLength: 1
    };
    $.fn.typeahead.Constructor = Typeahead;
    $.fn.typeahead.noConflict = function() {
        $.fn.typeahead = old;
        return this
    };
    $(document).on("focus.typeahead.data-api", '[data-provide="typeahead"]', function(e) {
        var $this = $(this);
        if ($this.data("typeahead")) {
            return
        }
        $this.typeahead($this.data())
    })
}(window.jQuery);
! function($) {
    var Affix = function(element, options) {
        this.options = $.extend({}, $.fn.affix.defaults, options);
        this.$window = $(window).on("scroll.affix.data-api", $.proxy(this.checkPosition, this)).on("click.affix.data-api", $.proxy(function() {
            setTimeout($.proxy(this.checkPosition, this), 1)
        }, this));
        this.$element = $(element);
        this.checkPosition()
    };
    Affix.prototype.checkPosition = function() {
        if (!this.$element.is(":visible")) {
            return
        }
        var scrollHeight = $(document).height(),
            scrollTop = this.$window.scrollTop(),
            position = this.$element.offset(),
            offset = this.options.offset,
            offsetBottom = offset.bottom,
            offsetTop = offset.top,
            reset = "affix affix-top affix-bottom",
            affix;
        if (typeof offset != "object") {
            offsetBottom = offsetTop = offset
        }
        if (typeof offsetTop == "function") {
            offsetTop = offset.top()
        }
        if (typeof offsetBottom == "function") {
            offsetBottom = offset.bottom()
        }
        affix = this.unpin != null && (scrollTop + this.unpin <= position.top) ? false : offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? "bottom" : offsetTop != null && scrollTop <= offsetTop ? "top" : false;
        if (this.affixed === affix) {
            return
        }
        this.affixed = affix;
        this.unpin = affix == "bottom" ? position.top - scrollTop : null;
        this.$element.removeClass(reset).addClass("affix" + (affix ? "-" + affix : ""))
    };
    var old = $.fn.affix;
    $.fn.affix = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data("affix"),
                options = typeof option == "object" && option;
            if (!data) {
                $this.data("affix", (data = new Affix(this, options)))
            }
            if (typeof option == "string") {
                data[option]()
            }
        })
    };
    $.fn.affix.Constructor = Affix;
    $.fn.affix.defaults = {
        offset: 0
    };
    $.fn.affix.noConflict = function() {
        $.fn.affix = old;
        return this
    };
    $(window).on("load", function() {
        $('[data-spy="affix"]').each(function() {
            var $spy = $(this),
                data = $spy.data();
            data.offset = data.offset || {};
            data.offsetBottom && (data.offset.bottom = data.offsetBottom);
            data.offsetTop && (data.offset.top = data.offsetTop);
            $spy.affix(data)
        })
    })
}(window.jQuery);
(function($, undefined) {
    if ($.zepto && !$.fn.removeData) {
        throw new ReferenceError("Zepto is loaded without the data module.")
    }
    $.fn.noUiSlider = function(options) {
        var namespace = ".nui",
            all = $(document),
            actions = {
                start: "mousedown touchstart",
                move: "mousemove touchmove",
                end: "mouseup touchend"
            },
            $VAL = $.fn.val,
            clsList = ["noUi-base", "noUi-origin", "noUi-handle", "noUi-input", "noUi-active", "noUi-state-tap", "noUi-target", "-lower", "-upper", "noUi-connect", "noUi-vertical", "noUi-horizontal", "noUi-background", "noUi-z-index"],
            stdCls = {
                base: [clsList[0]],
                origin: [clsList[1]],
                handle: [clsList[2]]
            },
            percentage = {
                to: function(range, value) {
                    value = range[0] < 0 ? value + Math.abs(range[0]) : value - range[0];
                    return (value * 100) / this.len(range)
                },
                from: function(range, value) {
                    return (value * 100) / this.len(range)
                },
                is: function(range, value) {
                    return ((value * this.len(range)) / 100) + range[0]
                },
                len: function(range) {
                    return (range[0] > range[1] ? range[0] - range[1] : range[1] - range[0])
                }
            },
            eventHandlers = [function() {
                this.target.val([!this.i ? this.val() : null, this.i ? this.val() : null], {
                    trusted: false
                })
            }, function(e) {
                e.stopPropagation()
            }];
        if (window.navigator.pointerEnabled) {
            actions = {
                start: "pointerdown",
                move: "pointermove",
                end: "pointerup"
            }
        } else {
            if (window.navigator.msPointerEnabled) {
                actions = {
                    start: "MSPointerDown",
                    move: "MSPointerMove",
                    end: "MSPointerUp"
                }
            }
        }

        function call(f, scope, args) {
            if (!$.isArray(f)) {
                f = [f]
            }
            $.each(f, function(i, q) {
                if (typeof q === "function") {
                    q.call(scope, args)
                }
            })
        }

        function instance(object) {
            return object instanceof $ || ($.zepto && $.zepto.isZ(object))
        }

        function fixEvent(e) {
            e.preventDefault();
            var touch = e.type.indexOf("touch") === 0,
                mouse = e.type.indexOf("mouse") === 0,
                pointer = e.type.indexOf("pointer") === 0,
                x, y, event = e;
            if (e.type.indexOf("MSPointer") === 0) {
                pointer = true
            }
            if (e.originalEvent) {
                e = e.originalEvent
            }
            if (touch) {
                x = e.changedTouches[0].pageX;
                y = e.changedTouches[0].pageY
            }
            if (mouse || pointer) {
                if (!pointer && window.pageXOffset === undefined) {
                    window.pageXOffset = document.documentElement.scrollLeft;
                    window.pageYOffset = document.documentElement.scrollTop
                }
                x = e.clientX + window.pageXOffset;
                y = e.clientY + window.pageYOffset
            }
            return $.extend(event, {
                x: x,
                y: y
            })
        }

        function attach(events, target, callback, scope, noAbstraction) {
            events = events.replace(/\s/g, namespace + " ") + namespace;
            if (noAbstraction) {
                if (noAbstraction > 1) {
                    scope = $.extend(target, scope)
                }
                return target.on(events, $.proxy(callback, scope))
            }
            scope.handler = callback;
            return target.on(events, $.proxy(function(e) {
                if (this.target.is('[class*="noUi-state-"], [disabled]')) {
                    return false
                }
                this.handler(fixEvent(e))
            }, scope))
        }

        function isNumeric(a) {
            return !isNaN(parseFloat(a)) && isFinite(a)
        }

        function getPercentage(a) {
            return parseFloat(this.style[a])
        }

        function test(o, set) {
            function ser(r) {
                return (instance(r) || typeof r === "string" || r === false)
            }
            var TESTS = {
                    handles: {
                        r: true,
                        t: function(q) {
                            q = parseInt(q, 10);
                            return (q === 1 || q === 2)
                        }
                    },
                    range: {
                        r: true,
                        t: function(q, o, w) {
                            if (q.length !== 2) {
                                return false
                            }
                            q = [parseFloat(q[0]), parseFloat(q[1])];
                            if (!isNumeric(q[0]) || !isNumeric(q[1])) {
                                return false
                            }
                            if (w === "range" && q[0] === q[1]) {
                                return false
                            }
                            if (q[1] < q[0]) {
                                return false
                            }
                            o[w] = q;
                            return true
                        }
                    },
                    start: {
                        r: true,
                        t: function(q, o, w) {
                            if (o.handles === 1) {
                                if ($.isArray(q)) {
                                    q = q[0]
                                }
                                q = parseFloat(q);
                                o.start = [q];
                                return isNumeric(q)
                            }
                            return this.parent.range.t(q, o, w)
                        }
                    },
                    connect: {
                        t: function(q, o) {
                            return (q === true || q === false || (q === "lower" && o.handles === 1) || (q === "upper" && o.handles === 1))
                        }
                    },
                    orientation: {
                        t: function(q) {
                            return (q === "horizontal" || q === "vertical")
                        }
                    },
                    margin: {
                        r: true,
                        t: function(q, o, w) {
                            q = parseFloat(q);
                            o[w] = q;
                            return isNumeric(q)
                        }
                    },
                    serialization: {
                        r: true,
                        t: function(q, o) {
                            if (!q.resolution) {
                                o.serialization.resolution = 0.01
                            } else {
                                switch (q.resolution) {
                                    case 1:
                                    case 0.1:
                                    case 0.01:
                                    case 0.001:
                                    case 0.0001:
                                    case 0.00001:
                                        break;
                                    default:
                                        return false
                                }
                            }
                            if (!q.mark) {
                                o.serialization.mark = "."
                            } else {
                                return (q.mark === "." || q.mark === ",")
                            }
                            if (q.to) {
                                if (o.handles === 1) {
                                    if (!$.isArray(q.to)) {
                                        q.to = [q.to]
                                    }
                                    o.serialization.to = q.to;
                                    return ser(q.to[0])
                                }
                                return (q.to.length === 2 && ser(q.to[0]) && ser(q.to[1]))
                            }
                            return false
                        }
                    },
                    slide: {
                        t: function(q) {
                            return typeof q === "function"
                        }
                    },
                    set: {
                        t: function(q, o) {
                            return this.parent.slide.t(q, o)
                        }
                    },
                    step: {
                        t: function(q, o, w) {
                            return this.parent.margin.t(q, o, w)
                        }
                    },
                    init: function() {
                        var obj = this;
                        $.each(obj, function(i, c) {
                            c.parent = obj
                        });
                        delete this.init;
                        return this
                    }
                },
                a = TESTS.init();
            $.each(a, function(i, v) {
                if ((v.r && (!o[i] && o[i] !== 0)) || ((o[i] || o[i] === 0) && !v.t(o[i], o, i))) {
                    if (console && console.log && console.group) {
                        console.group("Invalid noUiSlider initialisation:");
                        console.log("Option:\t", i);
                        console.log("Value:\t", o[i]);
                        console.log("Slider:\t", set[0]);
                        console.groupEnd()
                    }
                    throw new RangeError("noUiSlider")
                }
            })
        }

        function closest(value, to) {
            return Math.round(value / to) * to
        }

        function format(value, target) {
            value = value.toFixed(target.data("decimals"));
            return value.replace(".", target.data("mark"))
        }

        function setHandle(handle, to, forgive) {
            var nui = handle.data("nui").options,
                handles = handle.data("nui").base.data("handles"),
                style = handle.data("nui").style,
                hLimit;
            if (!isNumeric(to)) {
                return false
            }
            if (to === handle[0].gPct(style)) {
                return false
            }
            to = to < 0 ? 0 : to > 100 ? 100 : to;
            if (nui.step && !forgive) {
                to = closest(to, percentage.from(nui.range, nui.step))
            }
            if (to === handle[0].gPct(style)) {
                return false
            }
            if (handle.siblings("." + clsList[1]).length && !forgive && handles) {
                if (handle.data("nui").number) {
                    hLimit = handles[0][0].gPct(style) + nui.margin;
                    to = to < hLimit ? hLimit : to
                } else {
                    hLimit = handles[1][0].gPct(style) - nui.margin;
                    to = to > hLimit ? hLimit : to
                }
                if (to === handle[0].gPct(style)) {
                    return false
                }
            }
            if (handle.data("nui").number === 0 && to > 95) {
                handle.addClass(clsList[13])
            } else {
                handle.removeClass(clsList[13])
            }
            handle.css(style, to + "%");
            handle.data("store").val(format(percentage.is(nui.range, to), handle.data("nui").target));
            return true
        }

        function store(handle, S) {
            var i = handle.data("nui").number,
                scope = {
                    target: handle.data("nui").target,
                    options: handle.data("nui").options,
                    handle: handle,
                    i: i
                };
            if (instance(S.to[i])) {
                attach("change blur", S.to[i], eventHandlers[0], scope, 2);
                attach("change", S.to[i], scope.options.set, scope.target, 1);
                return S.to[i]
            }
            if (typeof S.to[i] === "string") {
                return $('<input type="hidden" name="' + S.to[i] + '">').appendTo(handle).addClass(clsList[3]).change(eventHandlers[1])
            }
            if (S.to[i] === false) {
                return {
                    val: function(a) {
                        if (a === undefined) {
                            return this.handleElement.data("nui-val")
                        }
                        this.handleElement.data("nui-val", a)
                    },
                    hasClass: function() {
                        return false
                    },
                    handleElement: handle
                }
            }
        }

        function move(event) {
            var base = this.base,
                style = base.data("style"),
                proposal = event.x - this.startEvent.x,
                baseSize = style === "left" ? base.width() : base.height();
            if (style === "top") {
                proposal = event.y - this.startEvent.y
            }
            proposal = this.position + ((proposal * 100) / baseSize);
            setHandle(this.handle, proposal);
            call(base.data("options").slide, base.data("target"))
        }

        function end() {
            var base = this.base,
                handle = this.handle;
            handle.children().removeClass(clsList[4]);
            all.off(actions.move);
            all.off(actions.end);
            $("body").off(namespace);
            base.data("target").change();
            call(handle.data("nui").options.set, base.data("target"))
        }

        function start(event) {
            var handle = this.handle,
                position = handle[0].gPct(handle.data("nui").style);
            handle.children().addClass(clsList[4]);
            attach(actions.move, all, move, {
                startEvent: event,
                position: position,
                base: this.base,
                target: this.target,
                handle: handle
            });
            attach(actions.end, all, end, {
                base: this.base,
                target: this.target,
                handle: handle
            });
            $("body").on("selectstart" + namespace, function() {
                return false
            })
        }

        function selfEnd(event) {
            event.stopPropagation();
            end.call(this)
        }

        function tap(event) {
            if (this.base.find("." + clsList[4]).length) {
                return
            }
            var i, handle, hCenter, base = this.base,
                handles = this.handles,
                style = base.data("style"),
                eventXY = event[style === "left" ? "x" : "y"],
                baseSize = style === "left" ? base.width() : base.height(),
                offset = {
                    handles: [],
                    base: {
                        left: base.offset().left,
                        top: base.offset().top
                    }
                };
            for (i = 0; i < handles.length; i++) {
                offset.handles.push({
                    left: handles[i].offset().left,
                    top: handles[i].offset().top
                })
            }
            hCenter = handles.length === 1 ? 0 : ((offset.handles[0][style] + offset.handles[1][style]) / 2);
            if (handles.length === 1 || eventXY < hCenter) {
                handle = handles[0]
            } else {
                handle = handles[1]
            }
            base.addClass(clsList[5]);
            setTimeout(function() {
                base.removeClass(clsList[5])
            }, 300);
            setHandle(handle, (((eventXY - offset.base[style]) * 100) / baseSize));
            call([handle.data("nui").options.slide, handle.data("nui").options.set], base.data("target"));
            base.data("target").change()
        }

        function create(options) {
            return this.each(function(index, target) {
                target = $(target);
                target.addClass(clsList[6]);
                var i, style, decimals, handle, base = $("<div/>").appendTo(target),
                    handles = [],
                    cls = {
                        base: stdCls.base,
                        origin: [stdCls.origin.concat([clsList[1] + clsList[7]]), stdCls.origin.concat([clsList[1] + clsList[8]])],
                        handle: [stdCls.handle.concat([clsList[2] + clsList[7]]), stdCls.handle.concat([clsList[2] + clsList[8]])]
                    };
                options = $.extend({
                    handles: 2,
                    margin: 0,
                    orientation: "horizontal"
                }, options) || {};
                if (!options.serialization) {
                    options.serialization = {
                        to: [false, false],
                        resolution: 0.01,
                        mark: "."
                    }
                }
                test(options, target);
                options.S = options.serialization;
                if (options.connect) {
                    if (options.connect === "lower") {
                        cls.base.push(clsList[9], clsList[9] + clsList[7]);
                        cls.origin[0].push(clsList[12])
                    } else {
                        cls.base.push(clsList[9] + clsList[8], clsList[12]);
                        cls.origin[0].push(clsList[9])
                    }
                } else {
                    cls.base.push(clsList[12])
                }
                style = options.orientation === "vertical" ? "top" : "left";
                decimals = options.S.resolution.toString().split(".");
                decimals = decimals[0] === "1" ? 0 : decimals[1].length;
                if (options.orientation === "vertical") {
                    cls.base.push(clsList[10])
                } else {
                    cls.base.push(clsList[11])
                }
                base.addClass(cls.base.join(" ")).data("target", target);
                target.data({
                    base: base,
                    mark: options.S.mark,
                    decimals: decimals
                });
                for (i = 0; i < options.handles; i++) {
                    handle = $("<div><div/></div>").appendTo(base);
                    handle.addClass(cls.origin[i].join(" "));
                    handle.children().addClass(cls.handle[i].join(" "));
                    attach(actions.start, handle.children(), start, {
                        base: base,
                        target: target,
                        handle: handle
                    });
                    attach(actions.end, handle.children(), selfEnd, {
                        base: base,
                        target: target,
                        handle: handle
                    });
                    handle.data("nui", {
                        target: target,
                        decimals: decimals,
                        options: options,
                        base: base,
                        style: style,
                        number: i
                    }).data("store", store(handle, options.S));
                    handle[0].gPct = getPercentage;
                    handles.push(handle);
                    setHandle(handle, percentage.to(options.range, options.start[i]))
                }
                base.data({
                    options: options,
                    handles: handles,
                    style: style
                });
                target.data({
                    handles: handles
                });
                attach(actions.end, base, tap, {
                    base: base,
                    target: target,
                    handles: handles
                })
            })
        }

        function getValue() {
            var re = [];
            $.each($(this).data("handles"), function(i, handle) {
                re.push(handle.data("store").val())
            });
            return (re.length === 1 ? re[0] : re)
        }

        function val(args, modifiers) {
            if (args === undefined) {
                return getValue.call(this)
            }
            modifiers = modifiers === true ? {
                trigger: true
            } : (modifiers || {});
            if (!$.isArray(args)) {
                args = [args]
            }
            return this.each(function(index, target) {
                target = $(target);
                $.each($(this).data("handles"), function(j, handle) {
                    if (args[j] === null || args[j] === undefined) {
                        return
                    }
                    var value, current, range = handle.data("nui").options.range,
                        to = args[j],
                        result;
                    modifiers.trusted = true;
                    if (modifiers.trusted === false || args.length === 1) {
                        modifiers.trusted = false
                    }
                    if (args.length === 2 && $.inArray(null, args) >= 0) {
                        modifiers.trusted = false
                    }
                    if ($.type(to) === "string") {
                        to = to.replace(",", ".")
                    }
                    to = percentage.to(range, parseFloat(to));
                    result = setHandle(handle, to, modifiers.trusted);
                    if (modifiers.trigger) {
                        call(handle.data("nui").options.set, target)
                    }
                    if (!result) {
                        value = handle.data("store").val();
                        current = percentage.is(range, handle[0].gPct(handle.data("nui").style));
                        if (value !== current) {
                            handle.data("store").val(format(current, target))
                        }
                    }
                })
            })
        }
        $.fn.val = function() {
            return this.hasClass(clsList[6]) ? val.apply(this, arguments) : $VAL.apply(this, arguments)
        };
        return create.call(this, options)
    }
}($));
(function() {
    var lastTime = 0;
    var vendors = ["webkit", "moz"];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"]
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall)
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id
        }
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id)
        }
    }
}());
var shiftDown = false;
var setShiftDown = function(event) {
    if (event.keyCode === 16 || event.charCode === 16) {
        shiftDown = true
    }
};
var setShiftUp = function(event) {
    if (event.keyCode === 16 || event.charCode === 16) {
        shiftDown = false
    }
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
}
$(document).on("keydown", function(e) {
    setShiftDown(e)
});
$(document).on("keyup", function(e) {
    setShiftUp(e)
});
$(document).on("scriptLoaded", function() {
    if (typeof(ui) !== "undefined") {
        for (var prop in ui) {
            (function(prop) {
                propContainerSelector = "#" + prop + "-interface";
                if (ui[prop].className) {
                    className = ui[prop].className + " "
                } else {
                    className = ""
                }
                $("#ui-container").append("<div class='interface " + className + "clearfix' id='" + prop + "-interface'></div>");
                if (ui[prop].type != "button") {
                    $(propContainerSelector).append("<label>" + ui[prop].title + "</label>")
                }
                if (isNumber(ui[prop].value) && (!$.isArray(ui[prop].values))) {
                    if (ui[prop].units) {
                        sliderInputBoxHTML = "<div class='input-group'><input class='form-control with-units' value='" + ui[prop].value + "'><span class='input-group-addon'>" + ui[prop].units + "</span></div>"
                    } else {
                        if (ui[prop].input === "readonly") {
                            sliderInputBoxHTML = "<input value='" + ui[prop].value + "' readonly>"
                        } else {
                            if (ui[prop].input === "hidden") {
                                sliderInputBoxHTML = "<input class='form-control' value='" + ui[prop].value + "' type='hidden'>"
                            } else {
                                sliderInputBoxHTML = "<input class='form-control' value='" + ui[prop].value + "'>"
                            }
                        }
                    }
                    $(propContainerSelector).append(sliderInputBoxHTML);
                    $(propContainerSelector).noUiSlider({
                        range: ui[prop].range,
                        start: ui[prop].value,
                        handles: 1,
                        connect: "lower",
                        step: (ui[prop].step) ? ui[prop].step : undefined,
                        slide: function() {
                            ui[prop].value = parseFloat($(this).val());
                            update(prop)
                        },
                        change: function() {
                            ui[prop].value = parseFloat($(this).val());
                            update(prop)
                        },
                        set: function() {
                            ui[prop].value = parseFloat($(this).val());
                            update(prop);
                            ga("send", "event", ui[prop].title, "slide", window.location.pathname)
                        },
                        serialization: {
                            to: (ui[prop].input !== "hidden" || ui[prop].input !== "readonly") ? [$("#" + prop + "-interface input")] : [false, false],
                            resolution: ui[prop].resolution
                        }
                    });
                    $("#" + prop + "-interface input").keydown(function(e) {
                        var value = parseInt($(propContainerSelector).val());
                        var increment = shiftDown ? 10 : 1;
                        switch (e.which) {
                            case 38:
                                $(propContainerSelector).val(value + increment);
                                ui[prop].value = parseFloat($(this).val());
                                ga("send", "event", ui[prop].title, "increment: +" + increment, window.location.pathname);
                                break;
                            case 40:
                                $(propContainerSelector).val(value - increment);
                                ui[prop].value = parseFloat($(this).val());
                                ga("send", "event", ui[prop].title, "decrement: -" + increment, window.location.pathname);
                                break
                        }
                        update(prop)
                    });
                    if (ui[prop].color) {
                        $("#" + prop + "-interface .noUi-connect").css("background-color", ui[prop].color)
                    }
                } else {
                    if (ui[prop].value === true || ui[prop].value === false) {
                        $("#" + prop + "-interface label").attr("for", prop + "-checkbox");
                        initialCheckboxSetting = ui[prop].value === true ? "checked" : "";
                        $(propContainerSelector).append("<div class='checkbox'><input type='checkbox' value='None' id='" + prop + "-checkbox' name='check' " + initialCheckboxSetting + " /><label for='" + prop + "-checkbox'></label></div>");
                        $("#" + prop + "-interface input").change(function() {
                            if ($(this).prop("checked")) {
                                ui[prop].value = true;
                                eventLabel = "checkbox: switch on"
                            } else {
                                ui[prop].value = false;
                                eventLabel = "checkbox: switch on"
                            }
                            ga("send", "event", ui[prop].title, eventLabel, window.location.pathname);
                            update(prop)
                        })
                    } else {
                        if ($.isArray(ui[prop].values)) {
                            $(propContainerSelector).append("<select class='form-control'></select");
                            for (var i = 0; i < ui[prop].values.length; i++) {
                                $("#" + prop + "-interface select").append("<option value='" + ui[prop].values[i][1] + "'>" + ui[prop].values[i][0] + "</option>")
                            }
                            $("#" + prop + '-interface select option[value="' + ui[prop].value + '"]').prop("selected", true);
                            $("#" + prop + "-interface select").change(function() {
                                ui[prop].value = $(this).val();
                                ga("send", "event", ui[prop].title, "Dropdown change: " + ui[prop].value, window.location.pathname);
                                $("#" + prop + "-interface select option").prop("selected", false).filter('[value="' + ui[prop].value + '"]').prop("selected", true);
                                update(prop)
                            })
                        } else {
                            if (ui[prop].type == "button") {
                                $(propContainerSelector).append("<button>" + ui[prop].title + "</button>").click(function() {
                                    update(prop)
                                })
                            } else {
                                $(propContainerSelector).append("<input value='" + ui[prop].value + "' readonly>")
                            }
                        }
                    }
                }
            })(prop)
        }
    }
    $("body").on("click", "#ui-container a", function(e) {
        ga("send", "event", $(this).html(), "click", window.location.pathname)
    });
    $(document).trigger({
        type: "uiLoaded"
    })
});

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
}

function Demo(settings) {
    var self = this;
    for (var name in settings) {
        this[name] = settings[name]
    }
    this.ui = typeof this.ui === "undefined" ? {} : this.ui;
    this.shiftDown = false;
    this.setShiftDown = function(event) {
        if (event.keyCode === 16 || event.charCode === 16) {
            self.shiftDown = true
        }
    };
    this.setShiftUp = function(event) {
        if (event.keyCode === 16 || event.charCode === 16) {
            self.shiftDown = false
        }
    };
    this.addUIElement = function(prop) {
        var ui = this.ui;
        var propContainerSelector = "#" + prop + "-interface";
        if (ui[prop].className) {
            className = ui[prop].className + " "
        } else {
            className = ""
        }
        $("#ui-container").append("<div class='interface " + className + "clearfix' id='" + prop + "-interface'></div>");
        if (ui[prop].type != "button") {
            $(propContainerSelector).append("<label>" + ui[prop].title + "</label>")
        }
        if (ui[prop].type == "userInputNumerical") {
            inputBoxHTML = "<input class='form-control user-input-numerical' value='" + ui[prop].value + "'>";
            $(propContainerSelector).append(inputBoxHTML);
            $("#" + prop + "-interface input").change(function() {
                ui[prop].value = $("#" + prop + "-interface input").val();
                ga("send", "event", ui[prop].title, "value changed", window.location.pathname)
            })
        } else {
            if (isNumber(ui[prop].value) && (!$.isArray(ui[prop].values))) {
                if (ui[prop].units) {
                    sliderInputBoxHTML = "<div class='input-group'><input class='form-control with-units' value='" + ui[prop].value + "'><span class='input-group-addon'>" + ui[prop].units + "</span></div>"
                } else {
                    if (ui[prop].input === "readonly") {
                        sliderInputBoxHTML = "<input value='" + ui[prop].value + "' readonly>"
                    } else {
                        if (ui[prop].input === "hidden") {
                            sliderInputBoxHTML = "<input class='form-control' value='" + ui[prop].value + "' type='hidden'>"
                        } else {
                            sliderInputBoxHTML = "<input class='form-control' value='" + ui[prop].value + "'>"
                        }
                    }
                }
                $(propContainerSelector).append(sliderInputBoxHTML);
                $(propContainerSelector).noUiSlider({
                    range: ui[prop].range,
                    start: ui[prop].value,
                    handles: 1,
                    connect: "lower",
                    step: (ui[prop].step) ? ui[prop].step : undefined,
                    slide: function() {
                        ui[prop].value = parseFloat($(this).val());
                        self.update(prop)
                    },
                    change: function() {
                        ui[prop].value = parseFloat($(this).val());
                        self.update(prop)
                    },
                    set: function() {
                        ui[prop].value = parseFloat($(this).val());
                        self.update(prop);
                        ga("send", "event", ui[prop].title, "slide", window.location.pathname)
                    },
                    serialization: {
                        to: (ui[prop].input !== "hidden" || ui[prop].input !== "readonly") ? [$("#" + prop + "-interface input")] : [false, false],
                        resolution: ui[prop].resolution
                    }
                });
                $("#" + prop + "-interface input").keydown(function(e) {
                    var value = parseInt($(propContainerSelector).val());
                    var increment = self.shiftDown ? 10 : 1;
                    switch (e.which) {
                        case 38:
                            $("#" + prop + "-interface input").val(value + increment);
                            ui[prop].value = parseFloat($(this).val());
                            ga("send", "event", ui[prop].title, "increment: +" + increment, window.location.pathname);
                            break;
                        case 40:
                            $("#" + prop + "-interface input").val(value - increment);
                            ui[prop].value = parseFloat($(this).val());
                            ga("send", "event", ui[prop].title, "decrement: -" + increment, window.location.pathname);
                            break
                    }
                    self.update(prop)
                });
                if (ui[prop].color) {
                    $("#" + prop + "-interface .noUi-connect").css("background-color", ui[prop].color)
                }
            } else {
                if (ui[prop].value === true || ui[prop].value === false) {
                    $("#" + prop + "-interface label").attr("for", prop + "-checkbox");
                    initialCheckboxSetting = ui[prop].value === true ? "checked" : "";
                    $(propContainerSelector).append("<div class='checkbox'><input type='checkbox' value='None' id='" + prop + "-checkbox' name='check' " + initialCheckboxSetting + " /><label for='" + prop + "-checkbox'></label></div>");
                    $("#" + prop + "-interface input").change(function() {
                        if ($(this).prop("checked")) {
                            ui[prop].value = true;
                            eventLabel = "checkbox: switch on"
                        } else {
                            ui[prop].value = false;
                            eventLabel = "checkbox: switch on"
                        }
                        ga("send", "event", ui[prop].title, eventLabel, window.location.pathname);
                        self.update(prop)
                    })
                } else {
                    if ($.isArray(ui[prop].values)) {
                        $(propContainerSelector).append("<select class='form-control'></select");
                        for (var i = 0; i < ui[prop].values.length; i++) {
                            $("#" + prop + "-interface select").append("<option value='" + ui[prop].values[i][1] + "'>" + ui[prop].values[i][0] + "</option>")
                        }
                        $("#" + prop + '-interface select option[value="' + ui[prop].value + '"]').prop("selected", true);
                        $("#" + prop + "-interface select").change(function() {
                            ui[prop].value = $(this).val();
                            ga("send", "event", ui[prop].title, "Dropdown change: " + ui[prop].value, window.location.pathname);
                            $("#" + prop + "-interface select option").prop("selected", false).filter('[value="' + ui[prop].value + '"]').prop("selected", true);
                            self.update(prop)
                        })
                    } else {
                        if (ui[prop].type == "button") {
                            $(propContainerSelector).append("<button>" + ui[prop].title + "</button>").click(function() {
                                self.update(prop)
                            })
                        } else {
                            $(propContainerSelector).append("<input value='" + ui[prop].value + "' readonly>")
                        }
                    }
                }
            }
        }
    };
    for (var prop in this.ui) {
        this.addUIElement(prop)
    }
    $("body").on("click", "#ui-container a", function(e) {
        ga("send", "event", $(this).html(), "click", window.location.pathname)
    });
    $(document).on("keydown", function(e) {
        self.setShiftDown(e)
    });
    $(document).on("keyup", function(e) {
        self.setShiftUp(e)
    });
    this.init()
}

function trackError(message, file, line) {}
window.onerror = function(message, file, line) {
    ga("send", "event", "JavaScript Error", message, file + ": Line " + line, {
        nonInteraction: 1
    })
};

function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {}
    return o
}
$(document).ready(function() {
    if ($("#demo").length) {
        $.getJSON("/search.json", function(data) {
            var items = [];
            demoArray = shuffle(data.entries);
            sidebarArray = [];
            i = 3;
            while (i) {
                potential = demoArray.pop();
                if (potential.url != "window.location.pathname" && potential.url.indexOf("/demos/") != -1) {
                    sidebarArray.push(potential);
                    htmlString = "<li><a href='" + potential.url + "' class='thumbnail'><img src='" + potential.url + "thumbnail.png' alt=''>";
                    htmlString += "<p class='thumbnail-title'>" + potential.title + "</p>";
                    htmlString += "</a></li>";
                    items.push(htmlString);
                    i--
                }
            }
            $("<ul>", {
                "class": "thumbnails",
                html: items.join("")
            }).appendTo(".sidebar")
        }).fail(function() {
            $(".sidebar").css("display", "none")
        })
    }
});
$("body").on("click", ".sidebar a", function(e) {
    e.preventDefault();
    ga("send", "event", "sidebar", "click", $(this).attr("href"));
    document.location = $(this).attr("href")
});