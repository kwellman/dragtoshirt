// http://www.softcomplex.com/docs/get_window_size_and_scrollbar_position.html
function f_scrollTop() {
    return f_filterResults (
        window.pageYOffset ? window.pageYOffset : 0,
        document.documentElement ? document.documentElement.scrollTop : 0,
        document.body ? document.body.scrollTop : 0
    );
}
function f_filterResults(n_win, n_docel, n_body) {
    var n_result = n_win ? n_win : 0;
    if (n_docel && (!n_result || (n_result > n_docel)))
        n_result = n_docel;
    return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
}

jQuery.Semaphore = function(value) {
    var self = this;
    self.value = typeof value === 'undefined' ? 1 : value;
    self.callbacks = new Array();

    self.link = function(callback) {
        if (self.value > 0)
            callback();
        else
            self.callbacks.push(callback);

        return self;
    };

    self.acquire = function() {
        self.value = self.value - 1;
        return self;
    };

    self.release = function() {
        self.value = self.value + 1;

        if (self.value > 0) {
            $.each(self.callbacks, function(i, callback) {
                callback();
            });
            //me.callbacks = [];
            self.callbacks.length = 0;
        }
        return self;
    };
};

function checkBoundaries(simplomat){
    var okay = true;
    var objects = $.merge([], simplomat.product.currentView.designs);
    objects = $.merge(objects, simplomat.product.currentView.texts);
    $.each(objects, function(i, obj){
        var objBoundary = obj.getBoundary();
        var viewBoundary = simplomat.product.currentView.boundary;
        if (objBoundary.x < viewBoundary.x) {
            okay = false;
            return false;
        }
        if (objBoundary.y < viewBoundary.y) {
            okay = false;
            return false;
        }
        if (objBoundary.x + objBoundary.width > viewBoundary.x + viewBoundary.width) {
            okay = false;
            return false;
        }
        if (objBoundary.y + objBoundary.height > viewBoundary.y + viewBoundary.height) {
            okay = false;
            return false;
        }
    });
    return okay;
}

jQuery.dragToShirt = new (function() {
    var self = this;

    self.init = function(config) {
        config = jQuery.extend({
            productTypes: ['175'],
            targetSize: 100,
            designerSize: 500,
            overlayZ: 1000,
            shopId: null,
            platform: 'na',
            showName: true,
            proxy: '/proxy.php'
        }, config);

        // use semaphore to make functions to execute until initialization is
        // complete
        var initSemaphore = new jQuery.Semaphore();
        
        // attach targets to body (will be filled later)
        var targets = $('<ul id="dts-targets"></ul>').css({position: 'absolute', 'max-width': 900}).hide().appendTo('body');
        $.each(config.productTypes, function(i, productType) {
            $('<li></li>').attr('id', 'dts-producttype'+productType).appendTo(targets).css({width:config.targetSize});
            //$('<li></li>').attr('id', 'dts-producttype'+productType).appendTo(targets).css({width:config.targetSize}).append($('<div></div>').css('width', config.targetSize));
        });

        // precache data
        var api = new SpreadshirtAPI(config.platform, config.shopId, config.proxy);

        api.getShop(config.shopId, function(shop) {
            api.shop = shop;

            api.getProductTypes(0, 1000, false, function(productTypes) {
                // make productType targets
                $.each(config.productTypes, function(i, productType) {
                    var data = productTypes.find('productType[id='+productType+']');
                    var name = data.children('name').text();
                    var src = data.children('resources').children('resource').attr('xlink:href');
                    // get default appearance id from src
                    var appearanceId = src.split('/').pop();

                    src = src+',width='+config.designerSize+',height='+config.designerSize;
                    var img = $('<img />').attr('src', src).css({width: config.targetSize, height: config.targetSize}).data('productType', productType).data('appearanceId', appearanceId).data('name', name);
                    img.appendTo('#dts-producttype'+productType);
                    //$('#dts-producttype'+productType).html('').append(img);
                    //$('<li></li>').append(img).appendTo('#dts-targets');
                    self.makeDroppable(img);
                });
            });

            api.getCurrency(shop.children("currency").attr("id"), initSemaphore.acquire().release);
            api.getCountry(shop.children("country").attr("id"), initSemaphore.acquire().release);
            api.getPrintType('17', initSemaphore.acquire().release); // "digi"
            //api.getPrintType('19'), function(){}); // "digi"

            initSemaphore.link(function() {
                api.currency = api.getCurrency(api.shop.children("currency").attr("id"));
                api.country = api.getCountry(api.shop.children("country").attr("id"));
            });
        });

        // TODO: attach list items

        // show productType name
        $('<span id="dts-name">').hide().appendTo('body')
        .css({position: 'absolute', top: 10, width: '100%', 'text-align': 'center', color: 'white', 'z-index': config.overlayZ+1});

        // TODO: bind esc key to close designer
        $(document).keyup(function(e) {
            if (e.keyCode == 27) { }   // esc
        });

        self.config = config;
        self.initSemaphore = initSemaphore;
        self.api = api;
        self.dragging = false;
        self.dropped = false;
    };

    self.showDesigner = function (productType, appearanceId, src, pos) {
        var config = self.config;
        var overlayZ = config.overlayZ;

        var simplomat = new CustomSimplomat();
        simplomat.defaultSize = config.designerSize;
        // FIXME: scale with designerSize
        simplomat.relativeScaleFactor = 0.625;

        simplomat.initCallback = function () {
            var pos = $('#dts-magnify').position();
            // make buy button clickable
            simplomat.buyButton[0].clickable = true;
            simplomat.buyButton[1].clickable = true;
            simplomat.buyButton[0].attr({"cursor": "pointer"});
            simplomat.buyButton[1].attr({"cursor": "pointer"});

            simplomat.buyNowHook = function(callback) {
                // TODO: check if size is selected
                if (simplomat.product.sizeId === undefined || simplomat.product.sizeId === null) {
                    alert("Please select a size!");
                    return false;
                }
                if (!checkBoundaries(simplomat)) {
                    alert('One or more elements are out of bounds!');
                    return false;
                }
                var top = pos.top-30 < 10 ? 10 : pos.top-30;
                $('<span id="dts-message">Creating product, please wait...</span>')
                .css({position: 'absolute', top: top, width: '100%', 'text-align': 'center', color: 'white', 'z-index': config.overlayZ+1})
                .appendTo('body').show(0, function() {setTimeout(callback, 10)});

                return true;
            }; 

            $('#dts-overlay').one('click', function() {
                designer.remove();
                $('#dts-name').hide();
                $('#dts-overlay').remove();
                $('#dts-close').remove();
                $('#dts-message').remove();
            });

            // add close button
            $('<a id="dts-close" href="#">close [x]</a>')
            .appendTo('body')
            .css({position: 'absolute', top: pos.top, left: pos.left+config.designerSize-50, 'text-decoration': 'none', color: 'white', 'font-size': '11px', 'font-style': 'normal', 'font-weight': 'bold', 'z-index': overlayZ+2})
            .click(function() { $('#dts-overlay').click(); });


            $('#dts-designer').css({'z-index': overlayZ+1, top: pos.top, left: pos.left}).show(100, function() { $('#dts-magnify').remove(); });
            
            // FIXME: move this to makeDraggable
            $('#dts-message').fadeOut('slow');
        };
        
        var designer = $('<div id="dts-designer"></div>').css({width: config.designerSize, height: config.designerSize, position: 'absolute', top: 30}).hide().appendTo('body');
        /*
        $('#dts-close').bind(function() {
            container.remove();
            designer.remove();
            $('#dts-overlay').remove();
        });
        */

        try {
            simplomat.init('dts-designer', config.designerSize, self.api, true, true, src, productType, appearanceId, null, 'digi', 0, 0, config.designerSize, config.designerSize);
        } catch(err) {
            var pos = $('#dts-magnify').position();
            // show error message
            $('<div id="dts-error">Product type ('+productType+') is not compatible</div>').css({color:'white', position: 'absolute', 'z-index': overlayZ+3, top: pos.top+config.designerSize/2-30, width: '100%', 'text-align': 'center'}).appendTo('body');

            var closeDesigner = function() {
                $('#dts-magnify').remove();
                $('#dts-error').remove();
                $('#dts-overlay').remove();
                $('#dts-name').hide();
                designer.remove();
            };

            $('#dts-magnify').one('click', closeDesigner);
            $('#dts-overlay').one('click', closeDesigner);
        }
    };

    self.makeDroppable = function(el) {
        var config = self.config;
        var overlayZ = config.overlayZ;

        // make targets droppable (requires jQuery UI)
        el.droppable({
            tolerance: "pointer",
            over: function() {
                if (config.showName) {
                    // show the productType name
                    $('#dts-name').text($(this).data('name'));
                    $('#dts-name').show();
                }
            },
            out: function() {
                // remove productType name
                $('#dts-name').hide();
            },
            drop: function(event, ui) {
                $('#dts-name').hide();
                self.dropped = true;
                
                var productType = $(this).data('productType');
                var appearanceId = $(this).data('appearanceId');
                var targetImg = $(this);
                
                var dragged = $(ui.draggable);
                var src = dragged.attr('dragtoshirt') || dragged.attr('src');

                // magnify image (requires jquery.magnifier http://www.dynamicdrive.com/)
                jQuery.imageMagnify.zIndexcounter = overlayZ+2;
                targetImg.imageMagnify({
                    magnifyto: config.designerSize,
                    magnifyduration: 1000,
                    id: 'dts-magnify',
                    closeOnClick: false,
                    callback: function(elem){
                        var pos = $('#dts-magnify').position();
                        var top = pos.top-30 < 10 ? 10 : pos.top-30;
                        // TODO: move css stuff to css file
                        $('<span id="dts-message">Loading designer, please wait...</span>')
                        .css({position: 'absolute', top: top, width: '100%', 'text-align': 'center', color: 'white', 'z-index': config.overlayZ+1})
                        .appendTo('body').show(0, function() {
                            // FIX for IE
                            setTimeout(function() {
                                self.showDesigner(productType, appearanceId, src, pos);
                            }, 0);
                        });
                    }
                }).click();
            }     
        });

    };

    self.makeDraggable = function(el) {
        var targets = $('#dts-targets');
        var overlayZ = self.config.overlayZ;

        // make images draggable (requires jQuery UI)
        el.draggable({
            helper: function() {
                // create draggable helper
                return $("<div>").attr("id", "helper").html("<span>Drag To Shirt</span><img id='thumb' src='" + $(this).attr("src") + "'>").appendTo("body");
            },
            iframeFix: true,
            cursor: "pointer",
            cursorAt: { left: -10, top: 20 },
            zIndex: overlayZ+2,
            start: function() {
                // show overlay
                $("<div>")
                .attr("id", "dts-overlay")
                .css("opacity", 0.9)
                .css('z-index', overlayZ)
                .appendTo("body").mouseup(function() {
                    if (!self.dropped) {
                        $(this).remove();
                    }
                });

                self.dragging = true;
                self.dropped = false;
                // stop showing tooltip
                //$("#dts-tip").remove();
                //$("#dts-tip").data('dragging', true);
                //$(this).unbind("mouseenter");
                //$(this).mouseleave();

                // show the targets
                var width = targets.width();
                //var maxWidth = config.targetSize * config.productTypes.length;
                //maxWidth = maxWidth > 800 ? 800 : maxWidth;
                //if (width < maxWidth)
                 //   width = maxWidth
                targets.css("left", ($("body").width() / 2) - width / 2)
                //.css("top", 0)
                .css("top", f_scrollTop()+20)
                .css('z-index', overlayZ+1)
                .slideDown(200);

                $('#dts-name').css('top', targets.position().top - 10);
            },
            stop: function() {
                // remove targets and overlay
                targets.slideUp(null, function() {
                    // magnify modifies opacity
                    targets.find('img').css({opacity: 1});
                    // Fix for IE
                    setTimeout(function() {
                        if (!self.dropped) {
                            $('#dts-overlay').remove();
                        }
                    }, 0);
                });
                self.dragging = false;
            }
        });
    };

    self.addTooltip = function(el) {
        /*
        el.mouseenter(function(e) {
            // show the tool tip
            if ($("#dts-tip").length === 0) {
               $("<div>")
               .html("<span>Drag this image to create shirt<\/span><span class='arrow'><\/span>")
               .attr("id", "dts-tip")
               .css({ left:e.pageX + 30, top:e.pageY - 16 })
               .appendTo("body")
               .fadeIn(800);
            }
        });
        */
        el.mousemove(function(e) {
            // show the tool tip
            if (self.dragging) {
                $("#dts-tip").remove();
                return;
            }

            if ($("#dts-tip").length === 0) {
               $("<div>")
               .html("<span>Drag this image to create shirt<\/span><span class='arrow'><\/span>")
               .attr("id", "dts-tip")
               .css({ left:e.pageX + 30, top:e.pageY - 16 })
               .appendTo("body")
               .fadeIn(800);
            } else {
                // tool tip follows the mouse
                $("#dts-tip").css({ 
                    left: e.pageX + 30,
                    top: e.pageY - 16
                });
            }
        });
        el.mouseleave(function() {
            // remove the tool tip
            $("#dts-tip").remove();
        });
    };
})();

jQuery.fn.dragToShirt = function() {
    jQuery.dragToShirt.addTooltip($(this));
    jQuery.dragToShirt.makeDraggable($(this));
};
