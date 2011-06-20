function CustomSimplomat() {
    this.butt = new Array();
    this.colorButt = new Array();
    this.viewButt = new Array();
    this.sizeButt = new Array();
    this.priceLabel;
    this.buyButton;

    this.initCustomFunctions = function() {
        this.customCreateActionButtons();
        this.customCreateColorButtons();
        this.customCreateViewButtons();
        this.customCreateSizeButtons();
        this.customCreatePriceLabel();
        this.customCreateBuyButton();
        for (var i = 0; i < this.colorButt.length; i++) {
            this.colorButt[i].show();
            this.colorButt[i].animate({scale: 1});
        }
        for (var i = 0; i < this.sizeButt.length; i++) {
            this.sizeButt[i].show();
            this.sizeButt[i].animate({scale: 1});
        }
        if (this.editAllowed) {
            var simplomat = this;
            this.product.image.click((this.product.image.click).andThen(function () {
                simplomat.enableEdit();
            }));
        }
        // kw
        if (this.initCallback !== undefined && this.initCallback !== null)
            this.initCallback();
    };
    /**
     * Create action buttons for zoom, rotation, design deletion, cancel editing.
     */
    this.customCreateActionButtons = function () {
        var simplomat = this;
        this.butt = new Array();
        // code for cancel editing button
        this.butt[0] = this.R.set();
        this.butt[0].push(this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({stroke: simplomat.boxStrokeColor, fill: simplomat.boxFillColor, "fill-opacity": .5, "stroke-width": 2}),
                this.R.path(new Path(this.relativeScaleFactor).M(5.0, 24.00).L(45.0, 24.00).L(45.0, 29.0).L(5.0, 29.0).L(5.0, 24.0).M(22.5, 5.00).L(22.5, 45).L(27.5, 45).L(27.5, 5).L(24, 5).Z().path).attr({stroke: "none", fill: simplomat.textColor}),
                this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({fill: simplomat.boxFillColor, opacity: 0}));
        this.butt[0].rotate(45);
        for (var i = 0; i < this.butt.length; i++) {
            this.butt[i].hide();
        }
        this.butt[0].translate(10 * this.relativeScaleFactor + this.offsetX, 40 * this.relativeScaleFactor + this.offsetY);
        this.butt[0][2].subject = this.butt[0][1];
        this.butt[0][2].simplomat = this;
        this.butt[0][2].click(function () {
            this.simplomat.disableEdit();
        }).mouseover(function () {
            this.subject.attr({fill: simplomat.highlightColor});
        }).mouseout(function () {
            this.subject.attr({fill: simplomat.textColor});
        });
        this.butt[0].hide();

        // code for rotating current design
        this.butt[1] = this.R.set();
        this.butt[1].push(this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({stroke:  simplomat.boxStrokeColor, fill: simplomat.boxFillColor, "fill-opacity": .5, "stroke-width": 2}),
                this.R.path(new Path(this.relativeScaleFactor).M(12.582, 9.551).C(3.251, 16.237, 0.921, 29.021, 7.08, 38.564).l(-2.36, 1.689).l(4.893, 2.262).l(4.893, 2.262).l(-0.568, -5.36).l(-0.567, -5.359).l(-2.365, 1.694).c(-4.657, -7.375, -2.83, -17.185, 4.352, -22.33).c(7.451, -5.338, 17.817, -3.625, 23.156, 3.824).c(5.337, 7.449, 3.625, 17.813, -3.821, 23.152).l(2.857, 3.988).c(9.617, -6.893, 11.827, -20.277, 4.935, -29.896).C(35.591, 4.87, 22.204, 2.658, 12.582, 9.551).Z().path).attr({stroke: "none", fill: simplomat.textColor}),
                this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({fill: simplomat.boxFillColor, opacity: 0}));
        this.butt[1].translate(10 * this.relativeScaleFactor + this.offsetX, 181 * this.relativeScaleFactor + this.offsetY);
        this.butt[1][2].subject = this.butt[1][1];
        this.butt[1][2].simplomat = this;
        this.butt[1][2].click(function () {
            if (this.simplomat.product.currentView.currentDesign != null)
                this.simplomat.product.currentView.currentDesign.rotate(-15);
        }).mouseover(function () {
            this.subject.attr({fill: simplomat.highlightColor});
        }).mouseout(function () {
            this.subject.attr({fill: simplomat.textColor});
        });
        this.butt[1].hide();

        // code for rotating current design
        this.butt[2] = this.R.set();
        this.butt[2].push(this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({stroke:  simplomat.boxStrokeColor, fill: simplomat.boxFillColor, "fill-opacity": .5, "stroke-width": 2}),
                this.R.path(new Path(this.relativeScaleFactor).M(37.566, 9.551).c(9.331, 6.686, 11.661, 19.471, 5.502, 29.014).l(2.36, 1.689).l(-4.893, 2.262).l(-4.893, 2.262).l(0.568, -5.36).l(0.567, -5.359).l(2.365, 1.694).c(4.657, -7.375, 2.83, -17.185, -4.352, -22.33).c(-7.451, -5.338, -17.817, -3.625, -23.156, 3.824).C(6.3, 24.695, 8.012, 35.06, 15.458, 40.398).l(-2.857, 3.988).C(2.983, 37.494, 0.773, 24.109, 7.666, 14.49).C(14.558, 4.87, 27.944, 2.658, 37.566, 9.551).Z().path).attr({stroke: "none", fill: simplomat.textColor}),
                this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({fill: simplomat.boxFillColor, opacity: 0}));
        this.butt[2].translate(10 * this.relativeScaleFactor + this.offsetX, 245 * this.relativeScaleFactor + this.offsetY);
        this.butt[2][2].subject = this.butt[2][1];
        this.butt[2][2].simplomat = this;
        this.butt[2][2].click(function () {
            if (this.simplomat.product.currentView.currentDesign != null)
                this.simplomat.product.currentView.currentDesign.rotate(15);
        }).mouseover(function () {
            this.subject.attr({fill: simplomat.highlightColor});
        }).mouseout(function () {
            this.subject.attr({fill: simplomat.textColor});
        });
        this.butt[2].hide();

        // code for zooming current design
        this.butt[3] = this.R.set();
        this.butt[3].push(this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({stroke: simplomat.boxStrokeColor, fill: simplomat.boxFillColor, "fill-opacity": .5, "stroke-width": 2}),
                this.R.path(new Path(this.relativeScaleFactor).M(5.0, 24.00).L(45.0, 24.00).L(45.0, 29.0).L(5.0, 29.0).L(5.0, 24.0).Z().path).attr({stroke: "none", fill: simplomat.textColor}),
                this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({fill: simplomat.boxFillColor, opacity: 0}));
        this.butt[3].translate(10 * this.relativeScaleFactor + this.offsetX, 311 * this.relativeScaleFactor + this.offsetY);
        this.butt[3][2].subject = this.butt[3][1];
        this.butt[3][2].simplomat = this;
        this.butt[3][2].click(function () {
            if (this.simplomat.product.currentView.currentDesign != null)
                this.simplomat.product.currentView.currentDesign.zoom(-0.1);
        }).mouseover(function () {
            this.subject.attr({fill: simplomat.highlightColor});
        }).mouseout(function () {
            this.subject.attr({fill: simplomat.textColor});
        });
        this.butt[3].hide();

        // code for zooming current design
        this.butt[4] = this.R.set();
        this.butt[4].push(this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({stroke: simplomat.boxStrokeColor, fill: simplomat.boxFillColor, "fill-opacity": .5, "stroke-width": 2}),
                this.R.path(new Path(this.relativeScaleFactor).M(5.0, 24.00).L(45.0, 24.00).L(45.0, 29.0).L(5.0, 29.0).L(5.0, 24.0).M(22.5, 5.00).L(22.5, 45).L(27.5, 45).L(27.5, 5).L(24, 5).Z().path).attr({stroke: "none", fill: simplomat.textColor}),
                this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({fill: simplomat.boxFillColor, opacity: 0}));
        this.butt[4].translate(10 * this.relativeScaleFactor + this.offsetX, 377 * this.relativeScaleFactor + this.offsetY);
        this.butt[4][2].subject = this.butt[4][1];
        this.butt[4][2].simplomat = this;
        this.butt[4][2].click(function () {
            if (this.simplomat.product.currentView.currentDesign != null)
                this.simplomat.product.currentView.currentDesign.zoom(+0.1);
        }).mouseover(function () {
            this.subject.attr({fill: simplomat.highlightColor});
        }).mouseout(function () {
            this.subject.attr({fill: simplomat.textColor});
        });
        this.butt[4].hide();

        // code for deleting current design
        this.butt[5] = this.R.set();
        this.butt[5].push(this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({stroke: simplomat.boxStrokeColor, fill: simplomat.boxFillColor, "fill-opacity": .5, "stroke-width": 2}),
                this.R.path(new Path(this.relativeScaleFactor).M(12.5, 5.00).L(12.5, 45).L(17.5, 45).L(17.5, 5).L(24, 5).Z().path).attr({stroke: "none", fill: simplomat.textColor}),
                this.R.path(new Path(this.relativeScaleFactor).M(22.5, 5.00).L(22.5, 45).L(27.5, 45).L(27.5, 5).L(24, 5).Z().path).attr({stroke: "none", fill: simplomat.textColor}),
                this.R.path(new Path(this.relativeScaleFactor).M(32.5, 5.00).L(32.5, 45).L(37.5, 45).L(37.5, 5).L(24, 5).Z().path).attr({stroke: "none", fill: simplomat.textColor}),
                this.R.circle(24.833 * this.relativeScaleFactor, 26.917 * this.relativeScaleFactor, 26.667 * this.relativeScaleFactor).attr({fill: simplomat.boxFillColor, opacity: 0}));
        this.butt[5].translate(10 * this.relativeScaleFactor + this.offsetX, 443 * this.relativeScaleFactor + this.offsetY);
        this.butt[5][4].subject1 = this.butt[5][1];
        this.butt[5][4].subject2 = this.butt[5][2];
        this.butt[5][4].subject3 = this.butt[5][3];
        this.butt[5][4].simplomat = this;
        this.butt[5][4].click(function () {
            if (this.simplomat.product.currentView.currentDesign != null)
                this.simplomat.product.currentView.currentDesign.remove();
        }).mouseover(function () {
            this.subject1.attr({fill: simplomat.highlightColor});
            this.subject2.attr({fill: simplomat.highlightColor});
            this.subject3.attr({fill: simplomat.highlightColor});
        }).mouseout(function () {
            this.subject1.attr({fill: simplomat.textColor});
            this.subject2.attr({fill: simplomat.textColor});
            this.subject3.attr({fill: simplomat.textColor});
        });
        this.butt[5].hide();
    };
    /**
     * Create buttons for product type appearance selection.
     */
    this.customCreateColorButtons = function () {
        var simplomat = this;
        this.colorButt = new Array();
        var buttons = this.colorButt;
        var row = 0;
        var column = 0;
        for (var i = 0; i < this.product.appearances.length; i++) {
            var appearance = this.product.appearances[i];
            this.colorButt[i] = this.R.set();
            this.colorButt[i].push(this.R.image(appearance.imageUrl, 0, 0, 30 * this.relativeScaleFactor, 30 * this.relativeScaleFactor).attr({"cursor": "pointer"}),
                    this.R.rect(0, 0, 30 * this.relativeScaleFactor, 30 * this.relativeScaleFactor).attr({stroke: simplomat.boxStrokeColor, "stroke-width": 2}));
            this.colorButt[i].hide();
            this.colorButt[i].translate(((620 + (column * 35)) * this.relativeScaleFactor) + this.offsetX, ((400 + (row * 35)) * this.relativeScaleFactor) + this.offsetY);
            this.colorButt[i][0].product = this.product;
            this.colorButt[i][0].myColor = "" + appearance.id;
            this.colorButt[i][0].subject = this.colorButt[i][1];
            this.colorButt[i][0].click(function () {
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i][0].subject.attr({stroke: simplomat.boxStrokeColor});
                }
                this.subject.strokeColor = simplomat.selectionColor;
                this.subject.attr({stroke: this.subject.strokeColor});
                this.product.changeAppearance(this.myColor);
            }).mouseover(function () {
                this.subject.strokeColor = this.subject.attr("stroke");
                this.subject.attr({stroke: simplomat.highlightColor});
            }).mouseout(function () {
                this.subject.attr({stroke: this.subject.strokeColor});
            });
            if (this.product.appearanceId == this.product.appearances[i].id) {
                this.colorButt[i][1].attr({stroke: simplomat.selectionColor});
            }
            column++;
            if ((i + 1) > 0 && (i + 1) % 5 == 0) {
                row++;
                column = 0;
            }
        }
    };
    /**
     * Create buttons for product type view selection.
     */
    this.customCreateViewButtons = function() {
        var simplomat = this;
        this.viewButt = new Array();
        var buttons = this.viewButt;
        var row = 0;
        var column = 0;
        for (var i = 0; i < this.product.views.length; i++) {
            var view = this.product.views[i];
            this.viewButt[i] = this.R.set();
            this.viewButt[i].push(this.R.rect(0, 0, 50 * this.relativeScaleFactor, 50 * this.relativeScaleFactor).attr({stroke: simplomat.boxStrokeColor, fill: simplomat.boxFillColor, "fill-opacity": .5, "stroke-width": 2}),
                    this.R.image(this.product.createViewImageUrl(view.id, this.product.appearanceId, 50), 0, 0, 50 * this.relativeScaleFactor, 50 * this.relativeScaleFactor).attr({"cursor": "pointer"}));
            this.viewButt[i].hide();
            this.viewButt[i].translate(((10 + (column * 55)) * this.relativeScaleFactor) + this.offsetX, ((600 + (row * 55)) * this.relativeScaleFactor) + this.offsetY);
            this.viewButt[i][1].product = this.product;
            this.viewButt[i][1].myView = "" + view.id;
            this.viewButt[i][1].subject = this.viewButt[i][0];
            this.viewButt[i][1].click(function () {
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i][1].subject.attr({stroke: simplomat.boxStrokeColor});
                }
                this.subject.strokeColor = simplomat.selectionColor;
                this.subject.attr({stroke: this.subject.strokeColor});
                this.product.changeView(this.myView);
            }).mouseover(function () {
                this.subject.strokeColor = this.subject.attr("stroke");
                this.subject.attr({stroke: simplomat.highlightColor});
            }).mouseout(function () {
                this.subject.attr({stroke: this.subject.strokeColor});
            });
            if (this.product.viewId == this.product.views[i].id) {
                this.viewButt[i][0].attr({stroke: simplomat.selectionColor});
            }
            column++;
            if ((i + 1) > 0 && (i + 1) % 3 == 0) {
                row++;
                column = 0;
            }
        }
    };
    this.customCreateSizeButtons = function() {
        var simplomat = this;
        this.sizeButt = new Array();
        var buttons = this.sizeButt;
        var row = 0;
        var column = 0;
        for (var i = 0; i < this.product.sizes.length; i++) {
            var size = this.product.sizes[i];
            this.sizeButt[i] = this.R.set();
            this.sizeButt[i].push(this.R.rect(0, 0, 53 * this.relativeScaleFactor, 30 * this.relativeScaleFactor)
                    .attr({stroke: simplomat.boxStrokeColor, fill: simplomat.boxFillColor, "fill-opacity": .5, "stroke-width": 2, "cursor": "pointer"}),
                    this.R.text(0, 0, size.name).attr({"font-size": Math.round(17 * this.relativeScaleFactor), "font-weight": "bold", "cursor": "pointer"}));
            var bounds = this.sizeButt[i][1].getBBox();
            this.sizeButt[i][1].attr({"x": ((this.sizeButt[i][0].attr("width")) - bounds.width) / 2 + bounds.width / 2,
                "y": ((this.sizeButt[i][0].attr("height")) - bounds.height) / 2 + bounds.height / 2});
            this.sizeButt[i][1].attr({fill: simplomat.textColor});
            this.sizeButt[i].hide();
            this.sizeButt[i].translate(((620 + (column * 58)) * this.relativeScaleFactor) + this.offsetX, ((600 + (row * 35)) * this.relativeScaleFactor) + this.offsetY);
            this.sizeButt[i][1].product = this.product;
            this.sizeButt[i][1].size = "" + size.id;
            this.sizeButt[i][1].subject = this.sizeButt[i][0];
            this.sizeButt[i][1].clickable = false;
            this.sizeButt[i][1].click(function () {
                if (this.clickable) {
                    for (var i = 0; i < buttons.length; i++) {
                        buttons[i][1].subject.attr({stroke: simplomat.boxStrokeColor});
                        buttons[i][1].attr({fill: simplomat.textColor});
                    }
                    this.subject.strokeColor = simplomat.selectionColor;
                    this.fillColor = simplomat.selectionColor;
                    this.attr({fill: this.fillColor});
                    this.subject.attr({stroke: this.subject.strokeColor});
                    this.product.changeSize(this.size);
                }
            }).mouseover(function () {
                if (this.clickable) {
                    this.subject.strokeColor = this.subject.attr("stroke");
                    this.fillColor = this.attr("fill");
                    this.attr({fill: simplomat.highlightColor});
                    this.subject.attr({stroke: simplomat.highlightColor});
                }
            }).mouseout(function () {
                if (this.clickable) {
                    this.attr({fill: simplomat.textColor});
                    this.attr({fill: this.fillColor});
                    this.subject.attr({stroke: this.subject.strokeColor});
                }
            });
            this.sizeButt[i][0].product = this.product;
            this.sizeButt[i][0].size = "" + size.id;
            this.sizeButt[i][0].subject = this.sizeButt[i][1];
            this.sizeButt[i][0].click(function () {
                if (this.subject.clickable) {
                    for (var i = 0; i < buttons.length; i++) {
                        buttons[i][1].subject.attr({stroke: simplomat.boxStrokeColor});
                        buttons[i][1].attr({fill: simplomat.textColor});
                    }
                    this.strokeColor = simplomat.selectionColor;
                    this.subject.fillColor = simplomat.selectionColor;
                    this.subject.attr({fill: this.subject.fillColor});
                    this.attr({stroke: this.strokeColor});
                    this.product.changeSize(this.size);
                }
            }).mouseover(function () {
                if (this.subject.clickable) {
                    this.strokeColor = this.attr("stroke");
                    this.subject.fillColor = this.subject.attr("fill");
                    this.subject.attr({fill: simplomat.highlightColor});
                    this.attr({stroke: simplomat.highlightColor});
                }
            }).mouseout(function () {
                if (this.subject.clickable) {
                    this.subject.attr({fill: simplomat.textColor});
                    this.subject.attr({fill: this.subject.fillColor});
                    this.attr({stroke: this.strokeColor});
                }
            });
            if (this.product.sizeId == ("" + this.product.sizes[i].id)) {
                this.sizeButt[i][1].attr({fill: simplomat.selectionColor});
                this.sizeButt[i][0].attr({stroke: simplomat.selectionColor});
            }
            column++;
            if ((i + 1) > 0 && (i + 1) % 3 == 0) {
                row++;
                column = 0;
            }
        }
        this.updateSizeButtons();
    };
    this.updateSizeButtons = function () {
        var simplomat = this;
        for (var i = 0; i < this.product.sizes.length; i++) {
            var availableSizes = this.product.getAvailableSizes();
            var available = false;
            for (var j = 0; j < availableSizes.length; j++) {
                if (availableSizes[j] == this.product.sizes[i].id) {
                    available = true;
                    break;
                }
            }
            if (available) {
                this.sizeButt[i][1].clickable = true;
                this.sizeButt[i][0].attr({fill: simplomat.boxFillColor});
            } else {
                this.sizeButt[i][1].clickable = false;
                this.sizeButt[i][0].attr({fill: simplomat.boxFillDeselectedColor});
            }
        }
    };
    this.customCreatePriceLabel = function() {
        if (this.priceLabel != null)
            this.priceLabel.remove();
        this.priceLabel = this.R.text(0, 0, "" + this.product.getFormatedPrice()).attr({"font-size": Math.round(25 * this.relativeScaleFactor), "font-weight": "bold", "fill": '#fff'});
        var bounds = this.priceLabel.getBBox();
        this.priceLabel.translate(((620 + 160 - bounds.width / 2) * this.relativeScaleFactor) + this.offsetX, 710 * this.relativeScaleFactor + this.offsetY);
    };
    this.customCreateBuyButton = function() {
        var simplomat = this;
        this.buyButton = this.R.set();
        this.buyButton.push(this.R.rect(0, 0, 170 * this.relativeScaleFactor, 30 * this.relativeScaleFactor).attr({stroke: this.boxStrokeColor, fill: this.boxFillColor, "fill-opacity": .5, "stroke-width": 2}),
                this.R.text(0, 0, "Buy now").attr({"font-size": Math.round(17 * this.relativeScaleFactor), stroke: "none", fill: this.textColor,  "font-weight": "bold"}));
        var bounds = this.buyButton[1].getBBox();
        this.buyButton[1].attr({"x": ((this.buyButton[0].attr("width")) - bounds.width) / 2 + bounds.width / 2,
            "y": ((this.buyButton[0].attr("height")) - bounds.height) / 2 + bounds.height / 2});
        this.buyButton.translate((620) * this.relativeScaleFactor + this.offsetX, (755) * this.relativeScaleFactor + this.offsetY);

        this.buyButton[1].subject = this.buyButton[0];
        this.buyButton[1].clickable = false;
        this.buyButton[1].simplomat = this;
        this.buyNowHook = null;
        this.buyHandler = function() {
            if (this.simplomat.buyNowHook !== null) {
                this.simplomat.buyNowHook(function() {
                    simplomat.createProductAndCheckout();
                });
                return;
            }
            if (this.clickable) {
                this.simplomat.createProductAndCheckout();
            }
        };
        this.buyButton[1].click(this.buyHandler).mouseover(function () {
            if (this.clickable) {
                this.subject.strokeColor = this.subject.attr("stroke");
                this.fillColor = this.attr("fill");
                this.attr({fill: simplomat.highlightColor});
                this.subject.attr({stroke: simplomat.highlightColor});
            }
        }).mouseout(function () {
            if (this.clickable) {
                this.attr({fill: simplomat.textColor});
                this.attr({fill: this.fillColor});
                this.subject.attr({stroke: this.subject.strokeColor});
            }
        });

        this.buyButton[0].subject = this.buyButton[1];
        this.buyButton[0].simplomat = this;
        this.buyButton[0].click(this.buyHandler).mouseover(function () {
            if (this.subject.clickable) {
                this.strokeColor = this.attr("stroke");
                this.subject.fillColor = this.subject.attr("fill");
                this.subject.attr({fill: simplomat.highlightColor});
                this.attr({stroke: simplomat.highlightColor});
            }
        }).mouseout(function () {
            if (this.subject.clickable) {
                this.subject.attr({fill: simplomat.textColor});
                this.subject.attr({fill: this.subject.fillColor});
                this.attr({stroke: this.strokeColor});
            }
        });
    };
    /**
     * Enable custom functions for zoom, rotation, view and appearance selection.
     */
    this.enableEditCustomFunctions = function() {
        for (var i = 0; i < this.butt.length; i++) {
            this.butt[i].show();
            this.butt[i].animate({scale: 1});
        }
        for (var i = 0; i < this.viewButt.length; i++) {
            this.viewButt[i].show();
            this.viewButt[i].animate({scale: 1});
        }
        /*for (var i = 0; i < this.colorButt.length; i++) {
         this.colorButt[i].show();
         this.colorButt[i].animate({scale: 1});
         }
         for (var i = 0; i < this.sizeButt.length; i++) {
         this.sizeButt[i].show();
         this.sizeButt[i].animate({scale: 1});
         } */
        this.R.safari();
    };
    /**
     * Disable custom functions for zoom, rotation, view and appearance selection.
     */
    this.disableEditCustomFunctions = function() {
        for (var i = 0; i < this.butt.length; i++) {
            this.butt[i].hide();
        }
        for (var i = 0; i < this.viewButt.length; i++) {
            this.viewButt[i].hide();
        }
        /*for (var i = 0; i < this.colorButt.length; i++) {
         this.colorButt[i].hide();
         }
         for (var i = 0; i < this.sizeButt.length; i++) {
         this.sizeButt[i].hide();
         } */
        this.R.safari();
    };
    this.viewChangedCustomFunctions = function() {

    };
    this.productTypeChangedCustomFunctions = function() {
        for (var i = 0; i < this.viewButt.length; i++) {
            this.viewButt[i].remove();
        }
        for (var i = 0; i < this.colorButt.length; i++) {
            this.colorButt[i].remove();
        }
        for (var i = 0; i < this.sizeButt.length; i++) {
            this.sizeButt[i].remove();
        }

        this.customCreateColorButtons();
        this.customCreateViewButtons();
        this.customCreateSizeButtons();

        for (var i = 0; i < this.colorButt.length; i++) {
            this.colorButt[i].show();
            this.colorButt[i].animate({scale: 1});
        }
        for (var i = 0; i < this.sizeButt.length; i++) {
            this.sizeButt[i].show();
            this.sizeButt[i].animate({scale: 1});
        }

        if (this.editMode) {
            this.enableEditCustomFunctions();
        } else {
            this.disableEditCustomFunctions();
        }

        this.appearanceChangedCustomFunctions();
        this.sizeChangedCustomFunctions();
        this.priceChangedCustomFunctions();
        this.R.safari();
    };
    this.sizeChangedCustomFunctions = function() {
        if (this.product.sizeId == null) {
            this.buyButton[1].clickable = false;
            this.buyButton[0].attr({"cursor": "default"});
            this.buyButton[1].attr({"cursor": "default"});
        } else {
            this.buyButton[1].clickable = true;
            this.buyButton[0].attr({"cursor": "pointer"});
            this.buyButton[1].attr({"cursor": "pointer"});
        }
    };
    this.appearanceChangedCustomFunctions = function() {
        for (var i = 0; i < this.viewButt.length; i++) {
            this.viewButt[i][1].attr({src: this.product.createViewImageUrl(this.viewButt[i][1].myView, this.product.appearanceId, 50)});
        }
        this.updateSizeButtons();
    };
    this.priceChangedCustomFunctions = function() {
        this.customCreatePriceLabel();
    };
}

CustomSimplomat.prototype = new Simplomat();
