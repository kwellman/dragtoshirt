// kw add content type to ajax requests and callbacks
// TODO: what happens when a sync call is made while async in progress?

function SpreadshirtAPI(platform, shopId, useProxy) {
    var me = this;

    this.getShop = function (shopId, callback) {
        if (this.shopCache[shopId] != null) {
            return this.shopCache[shopId];
        } else {
            var shop = null;
            $.ajax({
                type: "GET",
                async: typeof callback != 'undefined',
                cache: true,
                url: this.createUrl(this.baseHttpUrl + "/shops/" + shopId),
                contentType: 'application/xml', // kw
                dataType: "xml",
                success: function(data) {
                    shop = $(data).find("shop");
                    me.shopCache[shopId] = shop;
                    if (callback) {
                        callback(shop);
                    }
                }
            });
            return shop;
        }
    };

    this.getProductType = function (productTypeId, callback) {
        if (this.productTypeCache[productTypeId] != null) {
            return this.productTypeCache[productTypeId];
        } else {
            var productType = null;
            $.ajax({
                type: "GET",
                async: typeof callback != 'undefined',
                cache: true,
                url: this.createUrl(this.shop.find("productTypes").attr("xlink:href") + "/" + productTypeId),
                dataType: "xml",
                success: function(data) {
                    productType = $(data).find("productType");
                    me.productTypeCache[productTypeId] = productType;
                    if (callback)
                        callback(productType);
                }
            });
            //this.productTypeCache[productTypeId] = productType;
            return productType;
        }
    };
    this.createDesign = function (designXML, designUploadXML) {
        var returnLocation = null;
        var location = null;
        $.ajax({
            type: "POST",
            async: false,
            data: designXML,
            url: this.createUrl(this.shop.find("designs").attr("xlink:href")),
            contentType: 'application/xml', // kw
            dataType: "xml",
            complete: function(xmlHttp) {
                if (xmlHttp.status == 201) {
                    location = xmlHttp.getResponseHeader("Location");
                }
            }
        });
        if (location != null) {
            var design = null;
            $.ajax({
                type: "GET",
                async: false,
                cache: true,
                url: this.createUrl(location),
                dataType: "xml",
                success: function(data) {
                    design = $(data).find("design");
                }
            });
            var uploadLocation = design.children("resources").children("resource").attr("xlink:href");
            if (design != null) {
                $.ajax({
                    type: "PUT",
                    async: false,
                    data: designUploadXML,
                    //uploadLocation.replace(/http:\/\/image.spreadshirt.net/g, "http://origin.spreadshirt.net")
                    url: this.createUrl(uploadLocation),
                    beforeSend : function(request) {
                        request.setRequestHeader("Content-Type", "image/png");
                    },
                    complete: function(xmlHttp) {
                        returnLocation = location;
                    }
                });
            }
        }
        return returnLocation;
    };
    this.createProduct = function (productXML) {
        var location = null;
        $.ajax({
            type: "POST",
            async: false,
            data: productXML,
            url: this.createUrl(this.shop.find("products").attr("xlink:href")),
            contentType: 'application/xml', // kw
            dataType: "xml",
            complete: function(xmlHttp) {
                if (xmlHttp.status == 201) {
                    location = xmlHttp.getResponseHeader("Location");
                }
            }
        });
        return location;
    };
    this.createBasketAndCheckout = function(basketXML, basketItemXML) {
        var location = null;
        var itemLocation = null;
        var checkoutLocation = null;
        $.ajax({
            type: "POST",
            async: false,
            data: basketXML,
            url: this.createUrl(this.shop.find("baskets").attr("xlink:href")),
            contentType: 'application/xml', // kw
            dataType: "xml",
            complete: function(xmlHttp) {
                if (xmlHttp.status == 201) {
                    location = xmlHttp.getResponseHeader("Location");
                }
            }
        });
        if (location != null) {
            $.ajax({
                type: "POST",
                async: false,
                data: basketItemXML,
                url: this.createUrl(location + "/items"),
                contentType: 'application/xml', // kw
                dataType: "xml",
                complete: function(xmlHttp) {
                    if (xmlHttp.status == 201) {
                        itemLocation = xmlHttp.getResponseHeader("Location");
                    }
                }
            });
            if (itemLocation != null) {
                $.ajax({
                    type: "GET",
                    async: false,
                    url: this.createUrl(location + "/checkout") + "&secure=true",
                    dataType: "xml",
                    success: function(data) {
                        var ref = $(data).find("reference");
                        if (ref != null)
                            checkoutLocation = ref.attr("xlink:href");
                    }
                });
            }
        }
        return checkoutLocation;
    };
    this.getPrintType = function (printTypeId, callback) {
        if (this.printTypeCache[printTypeId] != null) {
            return this.printTypeCache[printTypeId];
        } else {
            var printType = null;
            $.ajax({
                type: "GET",
                async: typeof callback != 'undefined',
                cache: true,
                url: this.createUrl(this.shop.find("printTypes").attr("xlink:href") + "/" + printTypeId),
                dataType: "xml",
                success: function(data) {
                    printType = $(data).find("printType");
                    me.printTypeCache[printTypeId] = printType;
                    if (callback)
                        callback(printType);
                }
            });
            //this.printTypeCache[printTypeId] = printType;
            return printType;
        }
    };
    this.getFontFamily = function (fontFamilyId) {
        if (this.fontFamilyCache[fontFamilyId] != null) {
            return this.fontFamilyCache[fontFamilyId];
        } else {
            var fontFamily = null;
            $.ajax({
                type: "GET",
                async: false,
                cache: true,
                url: this.createUrl(this.shop.find("fontFamilies").attr("xlink:href") + "/" + fontFamilyId),
                dataType: "xml",
                success: function(data) {
                    fontFamily = $(data).find("fontFamily");
                }
            });
            this.fontFamilyCache[fontFamilyId] = fontFamily;
            return fontFamily;
        }
    };
    this.getCurrency = function (currencyId, callback) {
        if (this.currencyCache[currencyId] != null) {
            return this.currencyCache[currencyId];
        } else {
            var currency = null;
            $.ajax({
                type: "GET",
                async: typeof callback != 'undefined',
                cache: true,
                url: this.createUrl(this.shop.find("currencies").attr("xlink:href") + "/" + currencyId),
                dataType: "xml",
                success: function(data) {
                    currency = $(data).find("currency");
                    me.currencyCache[currencyId] = currency;
                    if (callback) 
                        callback(currency);
                }
            });
            //this.currencyCache[currencyId] = currency;
            return currency;
        }
    };
    this.getCountry = function (countryId, callback) {
        if (this.countryCache[countryId] != null) {
            return this.countryCache[countryId];
        } else {
            var country = null;
            $.ajax({
                type: "GET",
                async: typeof callback != 'undefined',
                cache: true,
                url: this.createUrl(this.shop.find("countries").attr("xlink:href") + "/" + countryId),
                dataType: "xml",
                success: function(data) {
                    country = $(data).find("country");
                    me.countryCache[countryId] = country;
                    if (callback)
                        callback(country);
                }
            });
            //this.countryCache[countryId] = country;
            return country;
        }
    };
    this.getDesign = function (designId) {
        if (this.designCache[designId] != null) {
            return this.designCache[designId];
        } else {
            var design = null;
            $.ajax({
                type: "GET",
                async: false,
                cache: true,
                url: this.createUrl(this.shop.find("designs").attr("xlink:href") + "/" + designId),
                dataType: "xml",
                success: function(data) {
                    design = $(data).find("design");
                }
            });
            this.designCache[designId] = design;
            return design;
        }
    };
    this.getMarketplaceDesigns = function (offset, limit, query) {
        var designs = null;
        $.ajax({
            type: "GET",
            async: false,
            cache: true,
            url: this.createUrl(this.shop.find("designCategories").attr("xlink:href") + "/b1000000/designs?offset=" + offset + "&limit=" + limit + "&query=" + query),
            dataType: "xml",
            success: function(data) {
                designs = $(data).find("designs");
            }
        });
        return designs;
    };
    this.getProductTypes = function (offset, limit, fullData, callback) {
        var productTypes = null;
        $.ajax({
            type: "GET",
            async: typeof callback != 'undefined',
            cache: true,
            url: this.createUrl(this.shop.find("productTypes").attr("xlink:href") + "?offset=" + offset + "&limit=" + limit + "&fullData=" + fullData),
            dataType: "xml",
            success: function(data) {
                productTypes = $(data).find("productTypes");
                if (callback) {
                    callback(productTypes);
                }
            }
        });
        return productTypes;
    };
    this.createUrl = function(url) {
        url = url.replace(/\?/g, '%3F');
        url = url.replace(/\&/g, '%26');
        url = url.replace(/\+/g, '%2B');

        return (this.useProxy) ? this.useProxy + '?url=' + url : url; // kw
        //return (this.useProxy) ? "proxy.php?url=" + url : url;
    };

    //this.baseHttpUrl = "http://vm39.virtual:8080/api/v1";
    //this.baseHttpsUrl = "https://vm39.virtual:8080/api/v1";
    this.baseHttpUrl = "http://api.spreadshirt.net/api/v1";
    this.baseHttpsUrl = "https://api.spreadshirt.net/api/v1";
    if (platform == 'na') {
        this.baseHttpUrl = "http://api.spreadshirt.com/api/v1";
        this.baseHttpsUrl = "https://api.spreadshirt.com/api/v1";
    }
    this.printTypeCache = new Array();
    this.productTypeCache = new Array();
    this.shopCache = new Array();
    this.designCache = new Array();
    this.currencyCache = new Array();
    this.countryCache = new Array();
    this.fontFamilyCache = new Array();
    this.useProxy = (useProxy == null) ? true : useProxy;
    // kw
    this.useProxy = (this.useProxy === true) ? '/proxy.php' : this.useProxy;
    this.shopId = shopId;
    // kw [make load function]
    this.load = function(){
        this.shop = this.getShop(shopId);
        this.currency = this.getCurrency(this.shop.children("currency").attr("id"));
        this.country = this.getCountry(this.shop.children("country").attr("id"));
    };
}

var Utf8 = {
    // public method for url encoding
    encode : function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // public method for url decoding
    decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
};
