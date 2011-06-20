/**
 * The Simplomat is a simple component that can be used to load and create products with
 * Spreadshirt using the Spreadshirt data and image API.
 *
 * @author mbs
 */
function Simplomat() {
    /* The default size of the simplomat. */
    this.defaultSize = 800;
    /* The relativeScaleFactor tells you how to scale your UI elements in case the simplomat
     is not rendered in default size 800 pixel. So if you render the simplomat with size
     600 pixel the factor is 600/800.*/
    this.relativeScaleFactor = null;
    /* Reference to the spreadshirt API required for communicating with spreadshirt. */
    this.spreadshirtAPI = null;
    /* RaphaelJs render canvas */
    this.R = null;
    /* Current product edited by Simplomat */
    this.product = null;
    /* True if editing is in general allowed otherwise false.*/
    this.editAllowed = null;
    /* True if simplomat is in edit mode otherwise false.*/
    this.editMode = false;
    this.width = null;
    this.height = null;
    this.offsetX = 0;
    this.offsetY = 0;

    this.selectionColor = "#ff8c00";
    this.highlightColor = "#fc0";
    this.textColor = "#000";
    this.boxStrokeColor = "#ccc";
    this.boxFillColor = "#fff";
    this.boxFillDeselectedColor = "#ccc";
    this.errorColor = "#FF0000";

    this.allowedPrintTypeIds = new Array();
    this.printTypeMode = "digi";
    this.printType = null;
    this.pixelAllowed = false;

    this.initCallback = null;
    this.enableEditCallback = null;
    this.disableEditCallback = null;
    this.productTypeChangedCallback = null;
    this.appearanceChangedCallback = null;
    this.viewChangedCallback = null;
    this.sizeChangedCallback = null;
    this.priceChangedCallback = null;
    this.errorCallback = null;

    /**
     * Initializes the simplomat.
     *
     * @param designerId the id of the div html element where the simplomat shall be rendered to
     * @param size the size of the simplomat in pixel, e.g. 600 means rendered as 600x600
     * @param spreadshirtAPI pointer to the spreadshirt API
     * @param edit turns edit mode on or off
     * @param editAllowed turns features for enabling/disabling edit mode on or off
     * @param image an image that shall be placed on the default view's default position or null
     * @param productTypeId id of a product type to start with
     * @param appearanceId id of the product type appearance to be used as default
     * @param viewId id of the product type view to display as default
     */
    this.init = function(designerId, size, spreadshirtAPI, edit, editAllowed, image, productTypeId, appearanceId, viewId, printTypeMode, offsetX, offsetY, width, height) {
        this.spreadshirtAPI = spreadshirtAPI;
        this.editAllowed = editAllowed;
        this.offsetX = (offsetX === undefined || offsetX === null) ? 0 : offsetX;
        this.offsetY = (offsetY === undefined || offsetY === null) ? 0 : offsetY;
        this.width = (width === undefined || width === null) ? size : width;
        this.height = (height === undefined || height === null) ? size : height;

        if (printTypeMode === undefined || printTypeMode === null)
            printTypeMode = "digi";

        if (printTypeMode == "flock") {
            this.printTypeMode = "flock";
            this.allowedPrintTypeIds.push("2");
            this.pixelAllowed = false;
        }
        else if (printTypeMode == "flex") {
            this.printTypeMode = "flex";
            this.allowedPrintTypeIds.push("14");
            this.pixelAllowed = false;
        } else {
            this.printTypeMode = "digi";
            this.allowedPrintTypeIds.push("17");
            this.allowedPrintTypeIds.push("19");
            this.pixelAllowed = true;
        }

        var printTypeXML = this.spreadshirtAPI.getPrintType(this.allowedPrintTypeIds[0]);
        var dpi = Number(printTypeXML.children("dpi").text());
        var printColors = new Array();
        if (printTypeXML.children("colors") != null) {
            printTypeXML.children("colors").children("color").each(function() {
                 var printColor = $(this);
                 printColors.push(new PrintColor(printColor.attr("id"),
                         printColor.children("fill").text(),
                         Number(printColor.children("price").children("vatIncluded").text())));
            });
        }
        this.printType = new PrintType(printTypeXML.attr("id"),
                dpi,
                Number(printTypeXML.children("price").children("vatIncluded").text()),
                PixelMMConverter.mmToPixel(Number(printTypeXML.children("size").children("width").text()), dpi),
                PixelMMConverter.mmToPixel(Number(printTypeXML.children("size").children("height").text()), dpi),
                printColors);

        this.R = Raphael(designerId, this.width, this.height);
        this.product = new Product(this.offsetX, this.offsetY, size, this).init(productTypeId, viewId, appearanceId);
        //this.relativeScaleFactor = size / this.defaultSize;
        // kw
        this.relativeScaleFactor = this.relativeScaleFactor || (size / this.defaultSize);
        this.initCustomFunctions();

        if (edit)
            this.enableEdit();

        if (image != null)
            this.product.currentView.addDesign(image, null, true);

        return this;
    };
    /**
     * Enable editing in simplomat. Allows to edit images and text on views.
     */
    this.enableEdit = function () {
        if (this.editMode == false) {
            this.editMode = true;
            this.product.currentView.enableEdit();
            this.enableEditCustomFunctions();
            this.R.safari();
        }
    };
    /**
     * Disable editing in simplomat. Disables simplomat edit feature.
     */
    this.disableEdit = function () {
        if (this.editMode == true) {
            this.editMode = false;
            this.product.currentView.disableEdit();
            this.disableEditCustomFunctions();
            this.R.safari();
        }
    };
    /**
     * Init method for initializing custom simplomat features. Overwrite method in
     * custom simplomat!
     */
    this.initCustomFunctions = function() {
        if (this.initCallback !== undefined && this.initCallback !== null)
            this.initCallback();
    };
    /**
     * Enable edit method for enabling custom simplomat features again. Overwrite method in
     * custom simplomat!
     */
    this.enableEditCustomFunctions = function() {
        if (this.enableEditCallback !== undefined && this.enableEditCallback !== null)
            this.enableEditCallback();
    };

    /**
     * Disable edit method for disabling custom simplomat features again. Overwrite method in
     * custom simplomat!
     */
    this.disableEditCustomFunctions = function() {
        if (this.disableEditCallback !== undefined && this.disableEditCallback !== null)
            this.disableEditCallback();
    };
    /**
     * Callback to inform custom simplomats about change of product type!. Overwrite method in
     * custom simplomat!
     */
    this.productTypeChangedCustomFunctions = function() {
        if (this.productTypeChangedCallback !== undefined && this.productTypeChangedCallback !== null)
            this.productTypeChangedCallback();
    };
    /**
     * Callback to inform custom simplomats about change of appearance!. Overwrite method in
     * custom simplomat!
     */
    this.appearanceChangedCustomFunctions = function() {
        if (this.appearanceChangedCallback !== undefined && this.appearanceChangedCallback !== null)
            this.appearanceChangedCallback();
    };
    /**
     * Callback to inform custom simplomats about change of a view!. Overwrite method in
     * custom simplomat!
     */
    this.viewChangedCustomFunctions = function() {
        if (this.viewChangedCallback !== undefined && this.viewChangedCallback !== null)
            this.viewChangedCallback();
    };
    /**
     * Callback to inform custom simplomats about change of a size!. Overwrite method in
     * custom simplomat!
     */
    this.sizeChangedCustomFunctions = function() {
        if (this.sizeChangedCallback !== undefined && this.sizeChangedCallback !== null)
            this.sizeChangedCallback();
    };
    /**
     * Callback to inform custom simplomats about change of price!. Overwrite method in
     * custom simplomat!
     */
    this.priceChangedCustomFunctions = function() {
        if (this.priceChangedCallback !== undefined && this.priceChangedCallback !== null)
            this.priceChangedCallback();
    };
    this.errorCustomFunctions = function(errorCode, errorMessage) {
        if (this.errorCallback !== undefined && this.errorCallback !== null)
            this.errorCallback(errorCode, errorMessage);
    };
    /**
     * Creates a new product with Spreadshirt using Spreadshirt API v1. Uploads images
     * not already available at Spreadshirt automatically.
     *
     * @return location of the created product, i.e. URL to access product via Spreadshirt data API
     */
    this.createProduct = function() {
        if (!this.uploadDesigns()) {
            if (this.product.href == null)
                this.product.href = this.spreadshirtAPI.createProduct(this.getProductXML());
            return this.product.href;
        }
        else {
            return null;
        }
    };
    this.createBasketAndCheckout = function () {
        if (this.product.sizeId === undefined || this.product.sizeId === null) {
            this.errorCustomFunctions("no_size", "Please select a product size!");
            return;
        }
        if (this.product.appearanceId === undefined || this.product.appearanceId === null) {
            this.errorCustomFunctions("no_appearance", "Please select a product color!");
            return;
        }
        if (this.product.href === undefined || this.product.href === null) {
            this.errorCustomFunctions("product_not_created", "Product not available at server!");
            return;
        }
        return this.spreadshirtAPI.createBasketAndCheckout(
                this.getBasketXML(),
                this.getBasketItemXML());
    };
    this.createProductAndCheckout = function() {
        if (this.product.sizeId === undefined || this.product.sizeId === null) {
            this.errorCustomFunctions("no_size", "Please select a product size!");
            return;
        }
        this.createProduct();
//            alert(this.product.href);
        if (this.product.href != null) {
           var checkoutLocation = this.createBasketAndCheckout();
           if (checkoutLocation != null)
             window.location.href = checkoutLocation;
        }
    };
    /**
     * Upload all designs used in the current product that are not already available via
     * the Spreadshirt API to Spreadshirt, i.e. arbitrary images from the Web.
     *
     * @return true in case errors occured otherwise false
     */
    this.uploadDesigns = function() {
        var error = false;
        var designsToUpload = new Array();

        // find all designs with no design ids - not from spreadshirt
        for (var i in this.product.views) {
            for (var j in this.product.views[i].designs) {
                var currentDesign = this.product.views[i].designs[j];
                if (currentDesign.id == null)
                    designsToUpload.push(currentDesign);
            }
        }

        // upload all designs unknown to Spreadshirt via the Spreadshirt image and data API
        for (i in designsToUpload) {
            var location = this.spreadshirtAPI.createDesign(this.getDesignXML(),
                    this.getDesignUploadXML(designsToUpload[i].src));
            if (location != null)
                designsToUpload[i].id = location.substring(location.lastIndexOf("/") + 1);
            else
                error = true;
        }
        return error;
    };
    /**
     * Returns a valid product XML that can be used to create a product at Spreadshirt
     * using the Spreadshirt data API. The product XML is a representation of the product
     * currently loaded by the Simplomat.
     *
     * @return the product XML
     */
    this.getProductXML = function() {
        var productXML = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                         "<product xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://api.spreadshirt.net\">\n" +
                         "  <productType id=\"" + this.product.productTypeId + "\"/>\n" +
                         "  <appearance id=\"" + this.product.appearanceId + "\"/>\n" +
                         "  <restrictions>\n" +
                         "     <freeColorSelection>false</freeColorSelection>\n" +
                         "     <example>false</example>\n" +
                         "  </restrictions>\n" +
                         "  <configurations>\n";
        for (var i in this.product.views) {
            var currentView = this.product.views[i];
            for (var j in currentView.designs) {
                var currentDesign = currentView.designs[j];
                var printColorRGBs = "";
                var printColorIds = "";
                for (var k in currentDesign.colors) {
                    if (k > 0) {
                        printColorRGBs += " ";
                        printColorIds += " ";
                    }
                    printColorRGBs += currentDesign.colors[k];
                    printColorIds += currentDesign.printColorIds[k];
                }
                var offsetX = Rounder.round(PixelMMConverter.pixelToMM(((currentDesign.x - this.offsetX) * currentView.width / this.product.size) - currentView.offsetX), this.printType.dpi);
                var offsetY = Rounder.round(PixelMMConverter.pixelToMM(((currentDesign.y - this.offsetY) * currentView.height / this.product.size) - currentView.offsetY), this.printType.dpi);
                var rotationCenterX = Rounder.round(PixelMMConverter.pixelToMM((currentDesign.width / 2) * currentView.width / this.product.size), this.printType.dpi);
                var rotationCenterY = Rounder.round(PixelMMConverter.pixelToMM((currentDesign.height / 2) * currentView.height / this.product.size), this.printType.dpi);
                var width = Rounder.round(PixelMMConverter.pixelToMM(currentDesign.width * currentView.width / this.product.size), this.printType.dpi);
                var height = Rounder.round(PixelMMConverter.pixelToMM(currentDesign.height * currentView.height / this.product.size), this.printType.dpi);
                productXML +=
                "    <configuration type=\"design\">\n" +
                "       <printArea id=\"" + currentView.printAreaId + "\"/>\n" +
                "        <printType id=\"" + this.product.getAppearance(this.product.appearanceId).printTypeId + "\"/>\n" +
                "        <offset unit=\"mm\">\n" +
                "            <x>" + offsetX + "</x>\n" +
                "            <y>" + offsetY + "</y>\n" +
                "        </offset>\n" +
                "        <content dpi=\"25.4\" unit=\"mm\">\n" +
                "            <svg>\n" +
                "                <image transform=\"" + (currentDesign.angle != 0 ? "rotate(" + currentDesign.angle + "," + rotationCenterX + "," + rotationCenterY + ")" : "") + "\" \n" +
                "                       width=\"" + width + "\" \n" +
                "                       height=\"" + height + "\" \n" +
                "                       printColorRGBs=\"" + printColorRGBs + "\" \n" +
                "                       printColorIds=\"" + printColorIds + "\" \n" +
                "                       designId=\"" + currentDesign.id + "\"/>\n" +
                "                <!--" + currentDesign.src + "-->\n" +
                "            </svg>\n" +
                "        </content>\n" +
                "        <restrictions>\n" +
                "            <changeable>false</changeable>\n" +
                "        </restrictions>\n" +
                "    </configuration>\n";
            }

            for (var j in currentView.texts) {
                var currentText = currentView.texts[j];
                var scale = PixelMMConverter.pixelToMM(currentView.width, this.printType.dpi) / this.product.size;
                var font = this.R.getFont(currentText.font.name);
                var ascent = Number(font.face.ascent);
                var descent = Math.abs(Number(font.face.descent));
                var ascentPercentage = ascent / (ascent + descent);
                var textX = (currentText.x - currentView.boundary.x) * scale;
                var textY = (currentText.y + currentText.fontSize * ascentPercentage - currentView.boundary.y) * scale;
                productXML +=
                "   <configuration type=\"text\">\n" +
                "      <printArea id=\"" + currentView.printAreaId + "\"/>\n" +
                "      <printType id=\"" + this.product.getAppearance(this.product.appearanceId).printTypeId + "\"/>\n" +
                "      <offset unit=\"mm\">\n" +
                "         <x>0.0</x>\n" +
                "         <y>0.0</y>\n" +
                "      </offset>\n" +
                "      <content dpi=\"25.4\" unit=\"mm\">\n" +
                "         <svg>\n" +
                "            <text transform=\"\" " +
                "                  fontId=\"" + currentText.font.id + "\" " +
                "                  fontFamilyId=\"" + currentText.font.familyId + "\" " +
                "                  font-family=\"" + currentText.font.name + "\" " +
                "                  font-style=\"" + currentText.font.style + "\" " +
                "                  font-weight=\"" + currentText.font.weight + "\" " +
                "                  font-size=\"" + (currentText.fontSize * scale) + "\" " +
                "                  text-anchor=\"" + currentText.textAnchor + "\" " +
                "                  x=\"" + textX + "\" " +
                "                  y=\"" + textY + "\" " +
                "                  fill=\"" + currentText.color + "\" " +
                "                  printColorId=\"" + currentText.printColorId + "\">";

                for (var k in currentText.textLines) {
                    var currentTextLine = currentText.textLines[k];
                    var textX = (currentTextLine.x - currentView.boundary.x) * scale;
                    var textY = (currentTextLine.y + currentTextLine.getFontSize() * ascentPercentage - currentView.boundary.y) * scale;
                    productXML +=
                    "<tspan transform=\"\" " +
                    "    fontId=\"" + currentTextLine.getFont().id + "\" " +
                    "    fontFamilyId=\"" + currentTextLine.getFont().familyId + "\" " +
                    "    font-family=\"" + currentTextLine.getFont().name + "\" " +
                    "    font-style=\"" + currentTextLine.getFont().style + "\" " +
                    "    font-weight=\"" + currentTextLine.getFont().weight + "\" " +
                    "    font-size=\"" + (currentTextLine.getFontSize() * scale) + "\" " +
                    "    text-anchor=\"" + currentTextLine.getTextAnchor() + "\" " +
                    "    x=\"" + textX + "\" " +
                    "    y=\"" + textY + "\" " +
                    "    fill=\"" + currentTextLine.getColor() + "\" " +
                    "    printColorId=\"" + currentTextLine.getPrintColorId() + "\">" + currentTextLine.textString + "</tspan>";
                }

                productXML += "</text>\n" +
                "         </svg>\n" +
                "      </content>\n" +
                "   </configuration>\n";
            }
        }
        productXML +=
        "  </configurations>\n" +
        "</product>\n";
        return productXML;
    };
    this.getBasketXML = function() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
               "<basket xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://api.spreadshirt.net\">\n" +
               "   <shop id=\"" + this.spreadshirtAPI.shopId + "\"/>\n" +
               "</basket>";
    };
    this.getBasketItemXML = function () {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
               "<basketItem xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://api.spreadshirt.net\">\n" +
               "   <shop id=\"" + this.spreadshirtAPI.shopId + "\"/>\n" +
               "   <description>my shop shirt</description>\n" +
               "   <quantity>1</quantity>\n" +
               "   <element type=\"sprd:product\" xlink:href=\"" + this.product.href + "\">\n" +
               "      <properties>\n" +
               "         <property key=\"appearance\">" + this.product.appearanceId + "</property>\n" +
               "         <property key=\"size\">" + this.product.sizeId + "</property>\n" +
               "      </properties>\n" +
               "   </element>\n" +
               "</basketItem>";
    };
    /**
     * Returns a valid design XML that can be used to create a new design using the
     * Spreadshirt data API.
     *
     * @return the design XML
     */
    this.getDesignXML = function() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
               "<design xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://api.spreadshirt.net\">\n" +
               "  <name>xxx</name>\n" +
               "  <description>zzz</description>\n" +
               "</design>";
    };
    /**
     * Returns a valid design reference XML that can be used to uploading an image
     * available on the Web to Spreadshirt image API.
     *
     * @param url a URL that points to an image that you want to upload to Spreadshirt
     * image API.
     * @return the design reference XML
     */
    this.getDesignUploadXML = function(url) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
               "<ref xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns=\"http://api.spreadshirt.net\" xlink:href=\"" + url + "\">";
    };
}

function ProductPartsFactory(product, size, simplomat) {
    this.product = product;
    this.size = size;
    this.simplomat = simplomat;

    this.createAppearances = function(productType) {
        var appearances = new Array();
        var allowedPrintTypeIds = this.simplomat.allowedPrintTypeIds;
        productType.children("appearances").children("appearance").each(
                function () {
                    var appearance = $(this);
                    var printTypeId = null;
                    appearance.children("printTypes").children("printType").each(
                            function() {
                                var id = $(this).attr("id");
                                for (key in allowedPrintTypeIds) {
                                    if (id === allowedPrintTypeIds[key]) {
                                        printTypeId = allowedPrintTypeIds[key];
                                        break;
                                    }
                                }
                            });

                    if (printTypeId != null) {
                        appearances.push(new Appearance(appearance.attr("id"),
                                appearance.children("name") != null ? appearance.children("name").text() : "",
                                appearance.children("description") != null ? appearance.children("description").text() : "",
                                appearance.children("resources").children("resource").attr("xlink:href"),
                                printTypeId));
                    }
                });
        return appearances;
    };
    this.createViews = function(productType) {
        var views = new Array();
        var allowedPrintTypeIds = this.simplomat.allowedPrintTypeIds;
        var product = this.product;
        var simplomat = this.simplomat;
        productType.children("views").children("view").each(
                function () {
                    var view = $(this);
                    var printArea = null;
                    var printAreaId = view.children("viewMaps").children("viewMap").children("printArea").attr("id");
                    productType.children("printAreas").children("printArea").each(function () {
                        var currentPrintArea = $(this);
                        if (printArea == null && printAreaId != null && currentPrintArea.attr("id") === printAreaId) {
                            var printTypeExcluded = false;

                            currentPrintArea.children("restrictions").children("excludedPrintTypes").
                                    children("excludedPrintType").each(function () {
                                var excludedPrintType = $(this);
                                for (key in allowedPrintTypeIds) {
                                    if (allowedPrintTypeIds[key] === excludedPrintType.attr("id")) {
                                        printTypeExcluded = true;
                                    }
                                }
                            });
                            if (!printTypeExcluded)
                                printArea = currentPrintArea;
                        }
                    });
                    if (printArea != null) {
                        views.push(new View(view.attr("id"),
                                PixelMMConverter.mmToPixel(Number(view.children("size").children("width").text()), simplomat.printType.dpi),
                                PixelMMConverter.mmToPixel(Number(view.children("size").children("height").text()), simplomat.printType.dpi),
                                PixelMMConverter.mmToPixel(Number(view.children("viewMaps").children("viewMap").children("offset").children("x").text()), simplomat.printType.dpi),
                                PixelMMConverter.mmToPixel(Number(view.children("viewMaps").children("viewMap").children("offset").children("y").text()), simplomat.printType.dpi),
                                printArea.attr("id"),
                                PixelMMConverter.mmToPixel(Number(printArea.children("boundary").children("size").children("width").text()), simplomat.printType.dpi),
                                PixelMMConverter.mmToPixel(Number(printArea.children("boundary").children("size").children("height").text()), simplomat.printType.dpi),
                                view.children("perspective").text(),
                                size / PixelMMConverter.mmToPixel(Number(view.children("size").children("width").text()), simplomat.printType.dpi),
                                product, simplomat));
                    }
                });
        return views;
    };
    this.createSizes = function(productType) {
        var sizes = new Array();
        productType.children("sizes").children("size").each(
                function () {
                    var size = $(this);
                    sizes.push(new Size(size.attr("id"), size.children("name").text()));
                });
        return sizes;
    };
    this.createAvailableSizes = function(productType, appearances) {
        var availableSizes = new Object();
        for (var i = 0; i < appearances.length; i++) {
            availableSizes[appearances[i].id] = new Array();
        }
        productType.children("stockStates").children("stockState").each(
                function () {
                    var stockState = $(this);
                    var appearanceId = stockState.children("appearance").attr("id");
                    var sizeId = stockState.children("size").attr("id");
                    var available = stockState.children("available").text();
                    var sizes = availableSizes[appearanceId];
                    if (available == "true" && sizes != null) {
                        sizes.push(sizeId);
                    }
                });
        return availableSizes;
    };
}

/**
 * A product represents a new or already existing piece of customized apparel to be
 * displayed or modified by a customer in a simplomat.
 *
 * @param offsetX the x offset of the rendered product on the RaphaelJs render canvas
 * @param offsetY the y offset of the rendered product on the RaphaelJs render canvas
 * @param size the size of the rendered product on the RaphaelJs render canvas
 * @param simplomat reference to the simplomat the product is used
 */
function Product(offsetX, offsetY, size, simplomat) {
    this.simplomat = simplomat;
    this.simplomat.product = this;
    this.productPartsFactory = new ProductPartsFactory(this, size, simplomat);
    this.href = null;

    /* image that holds the current views image */
    this.image = simplomat.R.image("img/empty.gif", offsetX, offsetY, size, size);
    this.image.simplomat = simplomat;
    this.image.product = this;
    this.image.click(function (event) {
        // design selected and click inside print area 
        if (this.product.currentView.currentDesign != null &&
            event.clientX >= this.product.currentView.boundary.x &&
            event.clientX <= (this.product.currentView.boundary.x + this.product.currentView.boundary.width) &&
            event.clientY >= this.product.currentView.boundary.y &&
            event.clientY <= (this.product.currentView.boundary.y + this.product.currentView.boundary.height)) {
            this.product.currentView.currentDesign.img[0].hide();
            this.product.currentView.currentDesign = null;
        }
    });

    /* offset position of product image inside RaphaelJs render area*/
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    /* size of the product product image on RaphaelJs render area*/
    this.size = size;

    /* list of available views - taken from product type*/
    this.views = new Array();
    /* list of available appearances - taken from product type */
    this.appearances = new Array();
    /* list of available sizes - taken from product type */
    this.sizes = new Array();
    this.availableSizes = new Object();

    /* id of the product type currently used */
    this.productTypeId = null;
    /* id of the product type appearance currently used */
    this.appearanceId = null;
    this.sizeId = null;
    /* id of the product type view currently used */
    this.viewId = null;
    /* default appearance id set for the used product type */
    this.defaultAppearanceId = null;
    /* default view id set for the used product type */
    this.defaultViewId = null;
    /* default image view url used to create urls on view changes */
    this.imageUrl = null;
    /* shortcut to the currently used and displayed view */
    this.currentView = null;

    this.priceFormatter = new PriceFormatter(this.simplomat.spreadshirtAPI.currency.children("pattern").text(),
            this.simplomat.spreadshirtAPI.currency.children("decimalCount").text(),
            this.simplomat.spreadshirtAPI.country.children("decimalPoint").text(),
            this.simplomat.spreadshirtAPI.country.children("thousandsSeparator").text());
    this.priceSymbol = this.simplomat.spreadshirtAPI.currency.children("symbol").text();
    this.price = null;

    /**
     *
     * @param productTypeId the id of the product type to be set
     * @param viewId the id of the product type view to be used
     * @param appearanceId the id of the product type appearance to be used
     * @param perspective optional perspective in case view id can not be given
     * @param appearanceName name of the appearance, e.g. black, white, ...
     * @param sizeName name of the size, e.g. M, L, XL
     * @return this product
     */
    this.init = function(productTypeId, viewId, appearanceId, perspective,
                         appearanceName, sizeName) {
        /* id of the product type currently used*/
        this.productTypeId = productTypeId;
        /* xml of the current product type*/
        var productType = this.simplomat.spreadshirtAPI.getProductType(productTypeId);
        /* default view image url */
        this.imageUrl = productType.children("resources").children("resource").attr("xlink:href");
        this.defaultAppearanceId = productType.find("defaultAppearance") == null
                ? null
                : productType.find("defaultAppearance").attr("id");
        this.defaultViewId = productType.find("defaultView") == null
                ? null
                : productType.find("defaultView").attr("id");
        /* id of the currently set product type appearance, i.e. color*/
        this.appearanceId = (appearanceId === null || appearanceId === undefined)
                ? this.defaultAppearanceId
                : appearanceId;
        /* id if the currently set product type view, e.g. front, back, etc.*/
        this.viewId = (viewId === null || viewId === undefined)
                ? this.defaultViewId
                : viewId;

        this.price = Number(productType.children("price").children("vatIncluded").text());


        this.appearances = this.productPartsFactory.createAppearances(productType);
        this.views = this.productPartsFactory.createViews(productType);
        this.sizes = this.productPartsFactory.createSizes(productType);
        this.availableSizes = this.productPartsFactory.createAvailableSizes(productType, this.appearances);

        for (var i = 0; i < this.appearances.length; i++) {
            if (this.appearances[i].name === appearanceName) {
                this.appearanceId = this.appearances[i].id;
                break;
            }
        }

        if (this.appearanceId === this.defaultAppearanceId) {
            var appearanceValid = false;
            for (var i = 0; i < this.appearances.length; i++) {
                if (this.appearances[i].id == this.appearanceId) {
                    appearanceValid = true;
                }
            }
            if (!appearanceValid)
                this.appearanceId = this.appearances[0].id;
        }

        for (var i = 0; i < this.views.length; i++) {
            if (this.views[i].perspective === perspective) {
                this.viewId = this.views[i].id;
                break;
            }
        }

        if (this.viewId === this.defaultViewId) {
            var viewValid = false;
            for (var i = 0; i < this.views.length; i++) {
                if (this.views[i].id == this.viewId) {
                    viewValid = true;
                }
            }
            if (!viewValid)
                this.viewId = this.views[0].id;
        }

        for (var i = 0; i < this.sizes.length; i++) {
            if (this.sizes[i].name === sizeName) {
                this.sizeId = this.sizes[i].id;
                break;
            }
        }

        this.changeView(this.viewId);
        return this;
    };
    /**
     * Returns a view for the given view id.
     *
     * @param viewId id of the view to be returned
     * @return a view or null
     */
    this.getView = function(viewId) {
        if (this.viewId != null) {
            for (var i = 0; i < this.views.length; i++) {
                if (this.views[i].id === viewId) {
                    return this.views[i];
                }
            }
        }
        return null;
    };
    /**
     * Returns an appearance for the given appearance id.
     *
     * @param appearanceId id of the appearance to be returned
     * @return an appearance or null
     */
    this.getAppearance = function(appearanceId) {
        for (var i = 0; i < this.appearances.length; i++) {
            if (this.appearances[i].id === appearanceId) {
                return this.appearances[i];
            }
        }
        return null;
    };
    this.getSize = function(sizeId) {
        for (var i = 0; i < this.sizes.length; i++) {
            if (this.sizes[i].id === sizeId) {
                return this.sizes[i];
            }
        }
        return null;
    };
    this.getAvailableSizes = function() {
        return this.availableSizes[this.appearanceId];
    };
    this.changeProductType = function(productTypeId) {
        var currentViews = this.views;
        var perspective = this.currentView.perspective;
        var appearanceName = this.getAppearance(this.appearanceId).name;
        var sizeName = (this.sizeId != null) ? this.getSize(this.sizeId).name : "";

        var productType = this.simplomat.spreadshirtAPI.getProductType(productTypeId);
        var views = this.productPartsFactory.createViews(productType);
        var appearances = this.productPartsFactory.createAppearances(productType);
        var sizes = this.productPartsFactory.createSizes(productType);

        if (views.length > 0 && appearances.length > 0 && sizes.length > 0) {
            for (var i = 0; i < this.views.length; i++) {
                this.views[i].detach();
            }

            this.views = new Array();
            this.appearances = new Array();
            this.sizes = new Array();
            this.availableSizes = new Array();
            this.productTypeId = null;
            this.appearanceId = null;
            this.sizeId = null;
            this.viewId = null;
            this.defaultAppearanceId = null;
            this.defaultViewId = null;
            this.imageUrl = null;
            this.currentView = null;

            this.init(productTypeId, null, null, perspective, appearanceName, sizeName);

            for (var i = 0; i < currentViews.length; i++) {
                var perspective = currentViews[i].perspective;
                var newView = this.currentView;
                for (var k = 0; k < this.views.length; k++) {
                    if (this.views[k].perspective === perspective) {
                        newView = this.views[k];
                        break;
                    }
                }
                for (var j = 0; j < currentViews[i].designs.length; j++) {
                    currentViews[i].designs[j].changeView(newView);
                }
                for (var j = 0; j < currentViews[i].texts.length; j++) { // kw
                    currentViews[i].texts[j].changeView(newView);
                }
            }

            this.simplomat.productTypeChangedCustomFunctions();
        }
    };
    /**
     * Changes view to the view for the given view id.
     *
     * @param viewId id of the view to be set
     */
    this.changeView = function(viewId) {
        if (this.getView(viewId) != null) {
            if (viewId == null)
                viewId = this.defaultViewId;

            if (this.currentView != null)
                this.currentView.hide();

            this.currentView = this.getView(viewId);
            this.viewId = viewId;
            this.currentView.show();
            this.simplomat.viewChangedCustomFunctions();
        }
    };
    /**
     * Changes appearance to the appearance for the given appearance id.
     *
     * @param appearanceId id of the appearance to be set
     */
    this.changeAppearance = function(appearanceId) {
        if (this.getAppearance(appearanceId) != null) {
            this.appearanceId = appearanceId;
            this.image.attr({src: this.createViewImageUrl(this.viewId, this.appearanceId, this.simplomat.defaultSize)});
            this.simplomat.appearanceChangedCustomFunctions();
            this.simplomat.priceChangedCustomFunctions();
        }
    };
    this.changeSize = function(sizeId) {
        if (this.getSize(sizeId) != null) {
            for (var i = 0; i < this.availableSizes[this.appearanceId].length; i++) {
                if (this.availableSizes[this.appearanceId][i] == sizeId) {
                    this.sizeId = sizeId;
                    this.simplomat.sizeChangedCustomFunctions();
                    break;
                }
            }
        }
    };
    /**
     * Removes all designs placed on the product's views.
     */
    this.removeAllDesigns = function() {
        for (var i in this.views) {
            for (var j in this.views[i].designs) {
                this.views[i].designs[j].remove();
            }
            this.views[i].designs = new Array();
            this.views[i].currentDesign = null;
        }
        this.simplomat.R.safari();
    };
    this.removeAllText = function() {
        for (var i in this.views) {
            for (var j in this.views[i].texts) {
                this.views[i].texts[j].remove();
            }
            this.views[i].texts = new Array();
        }
        this.simplomat.R.safari();
    };
    this.removeAll = function() {
        this.removeAllDesigns();
        this.removeAllText();
    };    
    /**
     * Create a valid view image URL for the given appearance id, view id and size
     * that can be used to request such an image from the image API.
     *
     * @param viewId id of the product type view to be used
     * @param appearanceId id of the product type appearance to be used
     * @param size size of the view image, i.e. size is used for width and height parameter
     * when requesting image from image API
     * @return valid view image url
     */
    this.createViewImageUrl = function(viewId, appearanceId, size) {
        return this.imageUrl.substr(0, this.imageUrl.indexOf("/views")) + "/views/" + viewId + "/appearances/" + appearanceId + ",width=" + size + ",height=" + size;
    };
    this.getFullPrice = function() {
        var price = this.price;
        for (var i = 0; i < this.views.length; i++) {
            for (var j = 0; j < this.views[i].designs.length; j++) {
                var design = this.views[i].designs[j];
                price += design.price;
                price += this.simplomat.printType.price;
                if (design.printColorIds !== undefined && design.printColorIds != null) {
                    for (var k = 0; k < design.printColorIds.length; k++) {
                        var printColorId = design.printColorIds[k];
                        var printColor = this.simplomat.printType.getPrintColorById(printColorId);
                        if (printColor != null)
                            price += printColor.price;
                    }
                }
            }
            for (var j = 0; j < this.views[i].texts.length; j++) {
                var text = this.views[i].texts[j];
                price += this.simplomat.printType.price;
                if (text.printColorId != undefined && text.printColorId != null) {
                    var printColor = this.simplomat.printType.getPrintColorById(text.printColorId);
                    if (printColor != null)
                        price += printColor.price;
                }
            }
        }
        return price;
    };
    this.getFormatedPrice = function() {
        return this.priceFormatter.formatPrice(this.getFullPrice(), this.priceSymbol);
    };
}

/**
 * An appearance represents a color/pattern combination, e.g. white, in which a product is available.
 * The appearance is actually taken from the product type not product!
 *
 * @param id the appearance id
 * @param name name of the appearance, e.g. white
 * @param description description of the appearance
 * @param imageUrl image url to a color picture
 * @param printTypeId printTypeId valid for this appearance
 */
function Appearance(id, name, description, imageUrl, printTypeId) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.imageUrl = imageUrl;
    this.printTypeId = printTypeId;
}

/**
 * A size represents a size, e.g. M, in which a product for a specific appearance is
 * available.
 * The size is actually taken from the product type not product!
 *
 * @param id the size id
 * @param name the name of the size, e.g. M
 */
function Size(id, name) {
    this.id = id;
    this.name = name;
}

/**
 * A product view represents a view of a product when looking at it from front, back or left.
 * The view is actually taken from the product type not product!
 *
 * @param id the view id
 * @param width actual width of the view image in pixel
 * @param height actual height of the view image in pixel
 * @param offsetX relative x position in pixel of the print area inside the view (view starts at x=0)
 * @param offsetY relative y position in pixel of the print area inside the view (view starts at y=0)
 * @param printAreaId id of the default print area of the view
 * @param printAreaWidth actual width of the print area in pixel
 * @param printAreaHeight actual height of the print area in pixel
 * @param perspective perspective is view direction, e.g. front, back, left, right
 * @param scaleFactor scale factor to scale actual view pixel values to the size of the simplomat
 * @param product
 * @param simplomat
 */
function View(id, width, height, offsetX, offsetY, printAreaId, printAreaWidth, printAreaHeight,
              perspective, scaleFactor, product, simplomat) {
    this.simplomat = simplomat;
    this.product = product;
    this.designs = new Array();
    this.texts = new Array();
    this.currentDesign = null;
    this.id = id;
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.printAreaId = printAreaId;
    this.printAreaWidth = printAreaWidth;
    this.printAreaHeight = printAreaHeight;
    this.perspective = perspective;
    this.scaleFactor = scaleFactor;
    this.boundary = new Boundary(this.product.offsetX + this.offsetX * this.scaleFactor,
            this.product.offsetY + this.offsetY * this.scaleFactor,
            this.printAreaWidth * this.scaleFactor,
            this.printAreaHeight * this.scaleFactor,
            simplomat);

    /**
     * Enable view editing, means show print area boundary and make designs selectable.
     */
    this.enableEdit = function () {
        this.boundary.show();

        for (var i in this.designs) {
            this.designs[i].enableEdit();
        }
        for (var i in this.texts) {
            this.texts[i].enableEdit();
        }
    };
    /**
     * Disable view editing, means hide print area boundary and disable design selectability.
     */
    this.disableEdit = function() {
        this.boundary.hide();

        for (var i in this.designs) {
            this.designs[i].disableEdit();
        }
        for (var i in this.texts) {
            this.texts[i].disableEdit();
        }
    };
    /**
     * Show current view and all designs on it. Make print area boundary visible in case
     * simplomat is in edit mode.
     */
    this.show = function() {
        this.product.image.attr({src: this.product.createViewImageUrl(this.id, this.product.appearanceId, this.simplomat.defaultSize)});
        for (var i in this.designs) {
            this.designs[i].show();
        }
        for (var i in this.texts) {
            this.texts[i].show();
        }
        if (this.simplomat.editMode)
            this.boundary.show();
    };
    /**
     * Hide current view and all designs on it. Make print area boundary invisible.
     */
    this.hide = function() {
        for (var i in this.designs) {
            this.designs[i].hide();
        }
        for (var i in this.texts) {
            this.texts[i].hide();
        }
        this.boundary.hide();
    };
    this.detachFromCanvas = function() {
        this.boundary.detachFromCanvas();
    };
    this.detach = function() {
        this.detachFromCanvas();
        this.product = null;
        this.simplomat = null;
    };
    /**
     * Add new design to current view. In case design is from the Web and unknown to
     * Spreadshirt provide source only. In case design is from Spreadshirt provide a
     * design id.
     *
     * @param src some URL to an image on the Web
     * @param designId Spreadshirt design id in case design is known to Spreadshirt
     * @param force force add in case simplomat is not in edit mode
     */
    this.addDesign = function(src, designId, force, colors, finalizeCallback) {
        if (this.simplomat.editMode || force) {
            var image = new Image();
            image.simplomat = this.simplomat;
            image.currentView = this;
            image.originalWidth = undefined;
            image.originalHeight = undefined;
            image.minimumScale = undefined;
            image.enlargable = undefined;

            var designAllowed = false;

            if (designId !== undefined && designId != null) {
                var design = this.simplomat.spreadshirtAPI.getDesign(designId);
                image.originalWidth = PixelMMConverter.mmToPixel(design.children("size").children("width").text(), this.simplomat.printType.dpi);
                image.originalHeight = PixelMMConverter.mmToPixel(design.children("size").children("height").text(), this.simplomat.printType.dpi);
                var vector = design.children("colors").children("color").length > 0;
                if (vector) {
                    image.minimumScale = Number(design.children("restrictions").children("minimumScale").text()) / 100;
                } else {
                    image.minimumScale = undefined;

                }
                image.enlargable = vector;
                image.colors = new Array();
                image.printColorIds = new Array();
                var printType = this.simplomat.printType;
                var i = 0;
                design.children("colors").children("color").each(function() {
                    var color = $(this).children("default").text();
                    if (colors != null) {
                        color = colors[i];
                    }
                    var printColor = printType.getPrintColor(color);
                    if (printColor == null) {
                        image.colors.push(color);
                    } else {
                        image.printColorIds.push(printColor.id);
                        image.colors.push(printColor.hex);
                    }
                    i++;
                });
                image.price = (design.find("vatIncluded") == null) ? 0 : Number(design.find("vatIncluded").text());
                var width = image.originalWidth * this.scaleFactor;
                var height = image.originalHeight * this.scaleFactor;
                var spaceX = 0;
                var spaceY = 0;
                var maxSize = 600;
                if (width > maxSize || height > maxSize) {
                    var size = (width > height) ? width : height;
                    var scale = maxSize / size;
                    width *= scale;
                    height *= scale;
                }

                if (width % 50 > 0) {
                    spaceX = 50 - width % 50;
                    width = width + spaceX;
                }
                if (height % 50 > 0) {
                    spaceY = 50 - height % 50;
                    height = height + spaceY;
                }
                src = (width > height)
                        ? design.children("resources").children("resource").attr("xlink:href") + "?width=" + width + "&backgroundColor=none"
                        : design.children("resources").children("resource").attr("xlink:href") + "?height=" + height + "&backgroundColor=none";
                for (var i = 0; i < image.colors.length; i++) {
                    src += "&colors[" + i + "]=" + image.colors[i].substr(1);
                }
                image.designId = designId;

                var simplomat = this.simplomat;
                design.children("printTypes").children("printType").each(
                        function() {
                            var printType = $(this);
                            for (i in simplomat.allowedPrintTypeIds) {
                                if (printType.attr("id") === simplomat.allowedPrintTypeIds[i]) {
                                    designAllowed = true;
                                    break;
                                }
                            }
                        });
            } else {
                image.price = 0;
                image.designId = null;

                if (this.simplomat.printTypeMode == "digi")
                    designAllowed = true;
            }

            if (designAllowed) {
                function createOnloadDelegate(contextObject, delegateMethod)
                {
                    return function()
                    {
                        return delegateMethod.apply(contextObject, arguments);
                    };
                }

                function imageOnload()
                {
                    var actualWidth = ((this.originalWidth === undefined) ? this.width : this.originalWidth) * this.currentView.scaleFactor;
                    var actualHeight = ((this.originalHeight === undefined) ? this.height : this.originalHeight) * this.currentView.scaleFactor;

                    var scale1 = 1;
                    if (actualWidth > this.currentView.boundary.width) {
                        scale1 = this.currentView.boundary.width / actualWidth;
                    }
                    if (actualHeight * scale1 > this.currentView.boundary.height) {
                        scale1 = this.currentView.boundary.height / actualHeight;
                    }

                    var imgX = this.currentView.boundary.x;
                    var imgY = this.currentView.boundary.y;
                    var imgWidth = actualWidth * scale1;
                    var imgHeight = actualHeight * scale1;
                    var zoomX = null;
                    var zoomY = null;

                    if ((this.currentView.boundary.width - (actualWidth * scale1)) > 0) {
                        imgX += (this.currentView.boundary.width - (actualWidth * scale1)) / 2;
                    }
                    if ((this.currentView.boundary.height - (actualHeight * scale1)) > 0) {
                        var offset = this.currentView.boundary.height / 6;
                        if (this.currentView.boundary.height - (imgHeight + offset) < 0) {
                            offset += this.currentView.boundary.height - (imgHeight + offset);
                        }
                        imgY += offset;
                    }

                    if (imgWidth === this.currentView.boundary.width ||
                        imgHeight === this.currentView.boundary.height) {
                        zoomX = 0.8;
                        zoomY = 0.8;
                    } else {
                        zoomX = 1;
                        zoomY = 1;
                    }

                    if (this.currentView.currentDesign != null) {
                        this.currentView.currentDesign.img[0].hide();
                    }

                    this.currentView.currentDesign = new Design(this.designId, this.src,
                            imgX, imgY, imgWidth, imgHeight, 0, zoomX, zoomY,
                            actualWidth, actualHeight, scale1,
                            this.minimumScale, this.enlargable, this.colors, this.printColorIds,
                            this.price, this.currentView, this.simplomat);
                    this.currentView.designs.push(this.currentView.currentDesign);                    

                    if (finalizeCallback !== undefined && finalizeCallback != null)
                        finalizeCallback.apply(this.currentView.currentDesign, []);

                    this.simplomat.priceChangedCustomFunctions();
                }

                image.onload = createOnloadDelegate(image, imageOnload);
                image.src = src;
            }
        }
    };
    /**
     * Add design coming from Spreadshirt to the current view.
     *
     * @param designId Spreadshirt design id
     * @param force force add in case simplomat is not in edit mode
     */
    this.addDesignById = function(designId, force) {
        this.addDesign(null, designId, force);
    };
    this.getViewScale = function() {
        return PixelMMConverter.pixelToMM(this.width, this.simplomat.printType.dpi) / this.product.size;
    };
    this.addText = function(textString, fontFamilyId, fontId, fontSize, color, force, finalizeCallback) {
        if (this.simplomat.editMode || force) {
            // TODO load font
            var fontFamily = this.simplomat.spreadshirtAPI.getFontFamily(fontFamilyId);
            if (fontFamily != null) {
                var font = null;
                fontFamily.children("fonts").children("font").each(function() {
                    var temp = $(this);
                    if (temp.attr("id") == fontId) {
                        font = temp;
                    }
                });
                if (font != null) {
                    var textX = this.boundary.x;
                    var textY = this.boundary.y;
                    var scale = this.getViewScale();
                    var textFont = new Font(fontId, fontFamilyId, font.children("name").text(),
                            font.children("style").text(), font.children("weight").text(),
                            font.children("minimalSize").text());
                    var printColor = this.simplomat.printType.getPrintColor(color);
                    var text = new Text(textFont, fontSize / scale,
                            color, (printColor == null) ? null : printColor.id, textX, textY, "start", this, this.simplomat);
                    this.texts.push(text);
                    text.addTextLine(textString, null, null, null, null, force, finalizeCallback);
                }
            }
        }
        return null;
    };
    this.addTextAndLayout = function(textString, maxTextLines, percentageWidth, fontFamilyId, fontId, fontSize, color, force, finalizeCallback) {
        var fontFamily = this.simplomat.spreadshirtAPI.getFontFamily(fontFamilyId);
            if (fontFamily != null) {
                var font = null;
                fontFamily.children("fonts").children("font").each(function() {
                    var temp = $(this);
                    if (temp.attr("id") == fontId) {
                        font = temp;
                    }
                });
                if (font != null) {
                    var maxWidth = this.boundary.width * percentageWidth / 100;
                    var scale = PixelMMConverter.pixelToMM(this.width, this.simplomat.printType.dpi) / this.product.size;

                    var textFont = new Font(fontId, fontFamilyId, font.children("name").text(),
                            font.children("style").text(), font.children("weight").text(),
                            font.children("minimalSize").text());

                    var temp = textString.split(' ');
                    var snipets = new Array();
                    for (var i = 0; i < temp.length; i++) {
                        var tempString = $.trim(temp[i]);
                        if (tempString !== "")
                            snipets.push(tempString);
                    }
                    var snipetSizes = new Array();
                    var whitespaceSize = null;

                    var text = new Text(textFont, fontSize / scale,
                            color, null, 5000, 5000, "start", this, this.simplomat);
                    for (var i = 0; i < snipets.length; i++) {
                        var textLine = new TextLine(snipets[i],
                                null, null, null, null, 5000, 5000, null, text,
                                this.simplomat);
                        snipetSizes.push(textLine.getBoundary().width);
                        textLine.remove();
                    }

                    var space = new TextLine("_",
                                null, null, null, null, 5000, 5000, null, text,
                                this.simplomat);
                    whitespaceSize = space.getBoundary().width;
                    space.remove();

                    var finalTextLineSizes = null;
                    var finalTextLines = null;
                    var tryAgain = false;
                    do {
                        tryAgain = false;
                        var textLines = new Array();
                        var textLineSizes = new Array();
                        var currentTextLine = "";
                        var currentWidth = 0;
                        var added = false;
                        for (var i = 0; i < snipets.length; i++) {
                            if (currentWidth > 0)
                                currentWidth += whitespaceSize;
                            currentWidth += snipetSizes[i];
                            if (currentWidth <= maxWidth) {
                                if (currentTextLine != "")
                                    currentTextLine += " ";
                                currentTextLine += snipets[i];
                            } else {
                                textLines.push(currentTextLine);
                                textLineSizes.push(currentWidth);
                                currentTextLine = snipets[i];
                                currentWidth = snipetSizes[i];
                            }
                        }
                        if (!added) {
                            textLines.push(currentTextLine);
                            textLineSizes.push(currentWidth);
                        }                        

                        var newMaxWidth = maxWidth;
                        for (var i = 0; i < textLineSizes.length; i++) {
                            if ((maxWidth - textLineSizes[i])/maxWidth > 0.2)
                                newMaxWidth = maxWidth * 0.95;
                        }

                        if (finalTextLines === null) {
                            finalTextLines = textLines;
                            finalTextLineSizes = textLineSizes;
                            if (newMaxWidth != maxWidth) {
                                tryAgain = true;
                                maxWidth = newMaxWidth;
                            }
                        } else {
                            if (finalTextLines.length === textLines.length) {
                                if (newMaxWidth != maxWidth) {
                                    finalTextLines = textLines;
                                    finalTextLineSizes = textLineSizes;
                                    tryAgain = true;
                                    maxWidth = newMaxWidth;
                                }
                            }
                        }
                    } while (tryAgain);

                    this.addText(finalTextLines, fontFamilyId, fontId, fontSize, color, force, finalizeCallback);
                }
            }
    };
}

/**
 * This boundary represents a simple rectangular boundary that can be used to illustrate
 * print areas for example and conduct collision detection.
 *
 * @param x
 * @param y
 * @param width
 * @param height
 * @param simplomat
 */
function Boundary(x, y, width, height, simplomat) {
    this.simplomat = simplomat;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.rect = this.simplomat.R.rect(this.x, this.y, this.width, this.height);
    this.rect.attr({stroke: this.simplomat.boxStrokeColor});
    this.rect.insertAfter(this.simplomat.product.image);

    this.show = function() {
        this.rect.show();
        this.rect.animate({scale: 1});
        this.simplomat.R.safari();
    };
    this.hide = function() {
        this.rect.hide();
        this.simplomat.R.safari();
    };
    this.detachFromCanvas = function() {
        this.rect.remove();
        this.simplomat.R.safari();
    };
    this.detach = function() {
        this.detachFromCanvas();
        this.simplomat = null;
    };
    this.hide();
}

/**
 * A design represents an image placed on a product view or the render canvas.
 *
 * @param id
 * @param src
 * @param x
 * @param y
 * @param width
 * @param height
 * @param angle
 * @param zoomX
 * @param zoomY
 * @param originalWidth
 * @param originalHeight
 * @param originalScale
 * @param minimumScale
 * @param enlargable
 * @param colors
 * @param price
 * @param view
 * @param simplomat
 */
function Design(id, src, x, y, width, height, angle, zoomX, zoomY,
                originalWidth, originalHeight, originalScale,
                minimumScale, enlargable, colors, printColorIds, price, view, simplomat) {
    this.simplomat = simplomat;
    this.view = view;
    this.id = id === undefined ? null : id;
    this.src = src;
    // keep x,y, width, height in sync
    this.angle = angle;
    this.zoomX = zoomX;
    this.zoomY = zoomY;
    this.originalWidth = originalWidth;
    this.originalHeight = originalHeight;
    this.originalScale = originalScale;
    this.minimumScale = (minimumScale === undefined) ? 0 : minimumScale;
    this.enlargable = (enlargable !== undefined);
    this.colors = colors;
    this.printColorIds = printColorIds;
    this.price = price;
    this.error = false;

    this.horizontalAlignment = "center";
    this.verticalAlignment = "center";

    this.img = this.simplomat.R.set();
    this.img.push(this.simplomat.R.rect(x, y, width, height).attr({stroke: this.simplomat.selectionColor, "stroke-dasharray": "- "}),
            this.simplomat.R.image(this.src, x, y, width, height));
    this.img.scale(this.zoomX, this.zoomY, x + width / 2, y);
    this.img.simplomat = simplomat;
    this.img[1].design = this;
    this.img[1].selectionRect = this.img[0];
    this.img[1].drag(function (dx, dy) {
        if (this.dragging) {
            var dragX = dx - this.odx;
            var dragY = dy - this.ody;
            this.design.moveByDelta(dragX, dragY);
            this.odx = dx;
            this.ody = dy;
        }
    },
            function () {
                if (this.dragging) {
                    if (this.design.view.currentDesign != null)
                        this.design.view.currentDesign.img[0].hide();
                    this.design.view.currentDesign = this.design;
                    this.design.img[0].show();
                    this.design.img[0].animate({x: this.design.img[0].attr("x")});
                    this.design.simplomat.R.safari();

                    this.ox = this.attr("x");
                    this.oy = this.attr("y");
                    this.odx = 0;
                    this.ody = 0;
                }
            },
            function () {
                if (this.dragging) {
                    this.design.finalizeAction();
                }
            });
    if (this.simplomat.editMode) {
        this.img[1].attr({cursor: "move"});
        this.img[1].dragging = true;
    } else {
        this.img[0].hide();
    }
    //this.img[0].animate({x: this.img[0].attr("x")});
    //this.img[1].animate({x: this.img[1].attr("x")});

    this.x = this.img[1].attr("x");
    this.y = this.img[1].attr("y");
    this.width = this.img[1].attr("width");
    this.height = this.img[1].attr("height");

    this.show = function() {
        if (this.view.currentDesign == this && this.simplomat.editMode)
            this.img[0].show();
        this.img[1].show();
        this.img[0].animate({x: this.img[0].attr("x")});
        this.img[1].animate({x: this.img[1].attr("x")});
        this.simplomat.R.safari();
    };
    this.hide = function() {
        this.img[0].hide();
        this.img[1].hide();
        this.simplomat.R.safari();
    };
    this.enableEdit = function() {
        if (this.view.currentDesign == this)
            this.img[0].show();
        this.img[1].attr({cursor: "move"});
        this.img[1].dragging = true;
    };
    this.disableEdit = function() {
        this.img[0].hide();
        this.img[1].attr({cursor: "auto"});
        this.img[1].dragging = false;
    };
    this.zoom = function(zoom) {
        if (zoom > 0) {
            var boundary = this.getBoundary(zoom);
            if (!this.enlargable) {
                if (this.zoomX + zoom <= 1) {
                    if ((boundary.width) <= (this.view.boundary.width) &&
                        (boundary.height) <= (this.view.boundary.height)) {
                        this.zoomX += zoom;
                        this.zoomY += zoom;
                    }
                } else {
                    this.zoomX = 1.0;
                    this.zoomY = 1.0;
                }
            } else {
                if ((boundary.width) <= (this.view.boundary.width) &&
                    (boundary.height) <= (this.view.boundary.height)) {
                    this.zoomX += zoom;
                    this.zoomY += zoom;
                }
            }
        } else {
            var scale = (this.minimumScale > 0) ? this.minimumScale : 0.1;
            if (this.zoomX + zoom >= scale) {
                this.zoomX += zoom;
                this.zoomY += zoom;
            }
        }
        this.img.scale(this.zoomX, this.zoomY);
        this.finalizeAction();
        this.simplomat.R.safari();
    };
    this.rotate = function(angle) {
        if (Math.abs(this.angle) == 360)
            this.angle = 0;
        this.angle += angle;
        this.img.rotate(this.angle, true);
        this.finalizeAction();
        this.simplomat.R.safari();
    };
    /**
     * Moves the design to a position relative to the given object.
     *
     * @param object design or text
     * @param verticalPosition above or below
     * @param horizontalPosition left, center or right aligned
     * @param space space between object and this design
     */
    this.moveToPositionRelativeTo = function (object, verticalPosition, horizontalPosition, space) {
        var bounds = object.getBoundary();
        var myBounds = this.getBoundary();
        var newX = this.x;
        var newY = this.y;
        if (verticalPosition == "above") {
            newY = bounds.y - space - myBounds.height;
        } else if (verticalPosition = "below") {
            newY = bounds.y + bounds.height + space;
        }
        if (horizontalPosition == "left") {
            newX = bounds.x;
        } else if (horizontalPosition == "center") {
            newX = bounds.x + bounds.width/2 - myBounds.width/2;
        } else if (horizontalPosition == "right") {
            newX = bounds.x + bounds.width - myBounds.width;
        }
        // consider rotation
        this.moveToPosition(newX, newY);
    };
    /**
     * Move to absolute x,y position.
     *
     * @param x
     * @param y
     */
    this.moveToPosition = function(x, y) {
        var deltaX = x - this.x;
        var deltaY = y - this.y;
        this.moveByDelta(deltaX, deltaY);
    };
    /**
     * Move to position on the printarea that is percentageX of print area width and
     * percentageY of print area height.
     *
     * @param percentageX
     * @param percentageY
     */
    this.moveToRelativePosition = function(percentageX, percentageY) {
        var bounds = this.getBoundary();
        var newX = this.view.boundary.x + this.view.boundary.width * percentageX / 100 - bounds.width/2;
        var newY = this.view.boundary.y + this.view.boundary.height * percentageY / 100 - bounds.height/2;
        this.moveToPosition(newX, newY);
    };
    /**
     * Move by given x and y values relative to current x,y coordinates.
     *
     * @param deltaX
     * @param deltaY
     */
    this.moveByDelta = function(deltaX, deltaY) {
        this.img[0].translate(deltaX, deltaY);
        this.img[1].translate(deltaX, deltaY);
        this.x += deltaX;
        this.y += deltaY;
    };
    this.remove = function() {
        this.img.remove();
        var currentDesign = this;
        this.view.designs = $.grep(this.view.designs, function(value) {
            return value != currentDesign;
        });
        this.view.currentDesign = null;
        this.simplomat.R.safari();
        this.simplomat.priceChangedCustomFunctions();
    };
    this.finalizeAction = function () {
        var error = false;
        var boundary = this.getBoundary();
        if (boundary.x < this.view.boundary.x)
            error = true;
        //x = this.view.boundary.x + (x - boundary.x);
        if (boundary.x > this.view.boundary.x + this.view.boundary.width - boundary.width)
            error = true;
        //x = this.view.boundary.x + this.view.boundary.width - boundary.width + (x - boundary.x);
        if (boundary.y < this.view.boundary.y)
            error = true;
        //y = this.view.boundary.y + (y - boundary.y);
        if (boundary.y > this.view.boundary.y + this.view.boundary.height - boundary.height)
            error = true;

        var maxPrintTypeWidth = this.view.scaleFactor * this.simplomat.printType.width
        var maxPrintTypeHeight = this.view.scaleFactor * this.simplomat.printType.height;

        if (boundary.width > maxPrintTypeWidth)
            error = true;
        if (boundary.height > maxPrintTypeHeight)
            error = true;

        //y = this.view.boundary.y + this.view.boundary.height - boundary.height + (y - boundary.y);
        this.img[0].attr("x", this.img[1].attr("x"));
        this.img[0].attr("y", this.img[1].attr("y"));
        this.x = this.img[1].attr("x");
        this.y = this.img[1].attr("y");
        this.width = this.img[1].attr("width");
        this.height = this.img[1].attr("height");
        if (error) {
            this.img[0].attr("stroke", this.simplomat.errorColor);
        }
        else {
            this.img[0].attr("stroke", this.simplomat.selectionColor);
        }
        this.error = error;

        var left = boundary.x - this.view.boundary.x;
        var right = (this.view.boundary.x + this.view.boundary.width) - (boundary.x + boundary.width);
        var top = boundary.y - this.view.boundary.y;
        var bottom = (this.view.boundary.y + this.view.boundary.height) - (boundary.y + boundary.height);

        if (left - 10 < right && left + 10 > right)
            this.horizontalAlignment = "center";
        else if (left < right)
            this.horizontalAlignment = "left"
        else
            this.horizontalAlignment = "right";

        if (top - 10 < bottom && top + 10 > bottom)
            this.verticalAlignment = "center";
        else if (top < bottom)
            this.verticalAlignment = "top";
        else
            this.verticalAlignment = "bottom";

        this.simplomat.R.safari();
    };
    this.getBoundary = function (zoom) {
        var imgX = this.img[1].attr("x");
        var imgY = this.img[1].attr("y");
        var imgWidth = this.img[1].attr("width");
        var imgHeight = this.img[1].attr("height");
        var centerX = imgX + imgWidth / 2;
        var centerY = imgY + imgHeight / 2;

        //x' = x1 + cosq * (x - x1) - sinq * (y - y1)
        //y' = y1 + sinq * (x - x1) + cosq * (y - y1)
        var rad = Math.PI / 180 * (+this.angle || 0);
        var x = new Array();
        var y = new Array();
        x[0] = centerX + Math.cos(rad) * (imgX - centerX) - Math.sin(rad) * (imgY - centerY);
        y[0] = centerY + Math.sin(rad) * (imgX - centerX) + Math.cos(rad) * (imgY - centerY);
        x[1] = centerX + Math.cos(rad) * ((imgX + imgWidth) - centerX) - Math.sin(rad) * (imgY - centerY);
        y[1] = centerY + Math.sin(rad) * ((imgX + imgWidth) - centerX) + Math.cos(rad) * (imgY - centerY);
        x[2] = centerX + Math.cos(rad) * (imgX - centerX) - Math.sin(rad) * ((imgY + imgHeight) - centerY);
        y[2] = centerY + Math.sin(rad) * (imgX - centerX) + Math.cos(rad) * ((imgY + imgHeight) - centerY);
        x[3] = centerX + Math.cos(rad) * ((imgX + imgWidth) - centerX) - Math.sin(rad) * ((imgY + imgHeight) - centerY);
        y[3] = centerY + Math.sin(rad) * ((imgX + imgWidth) - centerX) + Math.cos(rad) * ((imgY + imgHeight) - centerY);

        var minX = x[0];
        var minY = y[0];
        var maxX = x[0];
        var maxY = y[0];
        for (var i = 0; i < x.length; i++) {
            if (x[i] < minX)
                minX = x[i];
            if (x[i] > maxX)
                maxX = x[i];
            if (y[i] < minY)
                minY = y[i];
            if (y[i] > maxY)
                maxY = y[i];
        }

        var boundary = new Object();
        boundary.x = Math.round(minX * 100) / 100;
        boundary.y = Math.round(minY * 100) / 100;
        boundary.width = Math.round((maxX - minX) * 100) / 100;
        boundary.height = Math.round((maxY - minY) * 100) / 100;

        /*if (zoom !== undefined && zoom !== null) {
         var zoomedWidth = boundary.width * (this.zoomX + zoom);
         var zoomedHeight = boundary.height * (this.zoomY + zoom);
         boundary.x += zoomedWidth - boundary.width;
         boundary.y += zoomedHeight - boundary.height;
         boundary.width = zoomedWidth;
         boundary.height = zoomedHeight;
         } */

        return boundary;
    };
    this.detachFromCanvas = function() {
        this.img.remove();
        this.simplomat.R.safari();
    };
    this.detach = function() {
        this.detachFromCanvas();
        this.simplomat = null;
        this.view = null;
    };
    this.changeView = function(view) {
        var designBoundary = this.getBoundary();
        var oldBoundary = this.view.boundary;
        var newBoundary = view.boundary;

        var left = designBoundary.x - oldBoundary.x;
        var right = (oldBoundary.x + oldBoundary.width) - (designBoundary.x + designBoundary.width);
        var top = designBoundary.y - oldBoundary.y;
        var bottom = (oldBoundary.y + oldBoundary.height) - (designBoundary.y + designBoundary.height);

        var scaleX = newBoundary.width / oldBoundary.width;
        var scaleY = newBoundary.height / oldBoundary.height;

        view.currentDesign = this.view.currentDesign;
        this.view = view;
        this.view.designs.push(this);
        if (this.view != this.view.product.currentView)
            this.hide();

        var newX = 0;
        var newY = 0;
        if (this.horizontalAlignment == "center") {
            newX = newBoundary.width / 2 + newBoundary.x - designBoundary.width / 2;
        } else if (this.horizontalAlignment == "left") {
            newX = newBoundary.x + left * scaleX;
        } else {
            newX = newBoundary.x + newBoundary.width - right * scaleX - designBoundary.width;
        }

        if (this.verticalAlignment == "center") {
            newY = newBoundary.height / 2 + newBoundary.y - designBoundary.height / 2;
        } else if (this.verticalAlignment == "top") {
            newY = newBoundary.y + top * scaleY;
        } else {
            newY = newBoundary.y + newBoundary.height - bottom * scaleY - designBoundary.height;
        }

        if (this.angle != 0) {
            var centerX = this.x + this.width / 2;
            var centerY = this.y + this.height / 2;
            var rad = Math.PI / 180 * (+this.angle || 0);
            var rotatedX = centerX + Math.cos(rad) * (this.x - centerX) - Math.sin(rad) * (this.y - centerY);
            var rotatedY = centerY + Math.sin(rad) * (this.x - centerX) + Math.cos(rad) * (this.y - centerY);
            var diffX = (newX - designBoundary.x);
            var diffY = (newY - designBoundary.y);
            rotatedX += diffX;
            rotatedY += diffY;
            centerX += diffX;
            centerY += diffY;
            rad = Math.PI / 180 * (-this.angle || 0);
            newX = centerX + Math.cos(rad) * (rotatedX - centerX) - Math.sin(rad) * (rotatedY - centerY);
            newY = centerY + Math.sin(rad) * (rotatedX - centerX) + Math.cos(rad) * (rotatedY - centerY);
        }

        this.img[0].attr("x", newX);
        this.img[1].attr("x", newX);
        this.x = newX;
        this.img[0].attr("y", newY);
        this.img[1].attr("y", newY);
        this.y = newY;
    };

    this.finalizeAction();
}

/**
 * A text represents a text line placed on a product view or the render canvas.
 *
 * @param font
 * @param fontSize
 * @param color
 * @param printColorId
 * @param x
 * @param y
 * @param textAnchor
 * @param view
 * @param simplomat
 */
function Text(font, fontSize, color, printColorId,
              x, y, textAnchor, view, simplomat) {
    this.simplomat = simplomat;
    this.view = view;

    this.font = font;
    this.fontSize = fontSize;
    this.color = color;
    this.printColorId = printColorId;
    this.textAnchor = textAnchor;
    
    this.horizontalAlignment = "center"; // kw
    this.verticalAlignment = "center"; // kw
    
    this.x = x;
    this.y = y;

    this.dragging = false;

    this.textLines = new Array();

    this.addTextLine = function(textString, fontFamilyId, fontId, fontSize, color, force, finalizeCallback) {
        if (this.simplomat.editMode || force) {
            // TODO load font
            var actualFontSize = fontSize == null ? this.fontSize : fontSize;
            var actualFont = null;
            if (fontFamilyId != null) {
                var fontFamily = this.simplomat.spreadshirtAPI.getFontFamily(fontFamilyId);
                if (fontFamily != null) {
                    var font = null;
                    fontFamily.children("fonts").children("font").each(function() {
                        var temp = $(this);
                        if (temp.attr("id") == fontId) {
                            font = temp;
                        }
                    });
                    if (font != null) {
                        actualFont = new Font(fontId, fontFamilyId, font.children("name").text(),
                                font.children("style").text(), font.children("weight").text(),
                                font.children("minimalSize").text());
                    }
                }
           }
           var actualPrintColorId = null;
           if (color != null) {
                var printColor = this.simplomat.printType.getPrintColor(color);
                actualPrintColorId = printColor.id;
           }

           var textX = this.view.boundary.x;
           var textY = this.view.boundary.y;
           var scale = this.view.getViewScale();

           if (typeof textString == "string") {
              var textLine = new TextLine(textString, actualFont, fontSize == null ? null : fontSize/scale,
                      color, actualPrintColorId, textX, textY, "start", this, this.simplomat);
              this.textLines.push(textLine);
              if (this.dragging)
                   textLine.enableEdit();
           }  else {
               for (var i = 0; i < textString.length; i++) {
                   var textLine = new TextLine(textString[i], actualFont, fontSize == null ? null : fontSize/scale,
                        /* kw color, actualPrintColorId, textX, textY + i * actualFontSize/scale, "start", this, this.simplomat);*/
                        color, actualPrintColorId, textX, textY + (i*2) * actualFontSize/scale, "start", this, this.simplomat);
                   this.textLines.push(textLine);
                   if (this.dragging)
                       textLine.enableEdit();
               }
           }

           if (finalizeCallback !== undefined && finalizeCallback !== null)
               finalizeCallback.apply(this, []);

           this.simplomat.priceChangedCustomFunctions();

           if (this.view != this.simplomat.product.currentView)
               this.hide();

        }
    };
    this.show = function() {
        for (var i = 0, ii = this.textLines.length; i < ii; i++) {
            this.textLines[i].show();
        }
        this.simplomat.R.safari();
    };
    this.hide = function() {
        for (var i = 0, ii = this.textLines.length; i < ii; i++) {
            this.textLines[i].hide();
        }
        this.simplomat.R.safari();
    };
    this.enableEdit = function() {
        this.dragging = true;
        for (var i = 0, ii = this.textLines.length; i < ii; i++) {
            this.textLines[i].enableEdit();
        }
    };
    this.disableEdit = function() {
        this.dragging = false;
        for (var i = 0, ii = this.textLines.length; i < ii; i++) {
            this.textLines[i].disableEdit();
        }
    };
    this.zoom = function(zoom) {
        // TODO
    };
    this.rotate = function(angle) {
        // TODO
    };
    /**
     * Move to absolute x,y position.
     *
     * @param x
     * @param y
     */
    this.moveToPosition = function(x, y) {
        var deltaX = x - this.x;
        var deltaY = y - this.y;
        this.moveByDelta(deltaX, deltaY);
    };
    /**
     * Move to position on the printarea that is percentageX of print area width and
     * percentageY of print area height.
     *
     * @param percentageX
     * @param percentageY
     */
    this.moveToRelativePosition = function(percentageX, percentageY) {
        var bounds = this.getBoundary();
        var newX = this.view.boundary.x + this.view.boundary.width * percentageX / 100 - bounds.width/2;
        var newY = this.view.boundary.y + this.view.boundary.height * percentageY / 100 - bounds.height/2;
        this.moveToPosition(newX, newY);
    };
    /**
     * Move by given x and y values relative to current x,y coordinates.
     *
     * @param deltaX
     * @param deltaY
     */
    this.moveByDelta = function(deltaX, deltaY) {
        for (var i = 0, ii = this.textLines.length; i < ii; i++) {
            this.textLines[i].moveByDelta(deltaX, deltaY);
        }
        this.x += deltaX;
        this.y += deltaY;
    };
    this.remove = function() {
        var currentText = this;
        this.view.texts = $.grep(this.view.texts, function(value) {
            return value != currentText;
        });
        for (var i = 0, ii = this.textLines.length; i < ii; i++) {
            this.textLines[i].remove();
        }
        this.simplomat.R.safari();
        this.simplomat.priceChangedCustomFunctions();
    };
    this.finalizeAction = function () {
        // TODO
        /* start kw */
        var boundary = this.getBoundary();

        var left = boundary.x - this.view.boundary.x;
        var right = (this.view.boundary.x + this.view.boundary.width) - (boundary.x + boundary.width);
        var top = boundary.y - this.view.boundary.y;
        var bottom = (this.view.boundary.y + this.view.boundary.height) - (boundary.y + boundary.height);

        if (left - 10 < right && left + 10 > right)
            this.horizontalAlignment = "center";
        else if (left < right)
            this.horizontalAlignment = "left"
        else
            this.horizontalAlignment = "right";

        if (top - 10 < bottom && top + 10 > bottom)
            this.verticalAlignment = "center";
        else if (top < bottom)
            this.verticalAlignment = "top";
        else
            this.verticalAlignment = "bottom";
        /* end kw */

        this.simplomat.R.safari();
    };
    this.getBoundary = function (zoom) {
        var minX = null;
        var minY = null;
        var maxX = null;
        var maxY = null;

        for (var i = 0, ii = this.textLines.length; i < ii; i++) {
            var bounds = this.textLines[i].getBoundary();
            if (minX == null || bounds.x < minX)
                minX = bounds.x;
            if (minY == null || bounds.y < minY)
                minY = bounds.y;
            if (maxX == null || bounds.x + bounds.width > maxX)
                maxX = bounds.x + bounds.width;
            if (maxY == null || bounds.y + bounds.height > maxY)
                maxY = bounds.y + bounds.height;
        }
        var boundary = new Object();
        boundary.x = minX;
        boundary.y = minY;
        boundary.width = maxX - minX;
        boundary.height = maxY - minY;
        return boundary;
    };
    this.detachFromCanvas = function() {
        // TODO
        //for (var i = 0, ii = this.textLines.length; i < ii; i++) { // kw
        //    this.textLines[i].remove();
        //}
        //this.simplomat.R.safari(); // kw
    };
    this.detach = function() {
        // TODO
        //this.detachFromCanvas(); // kw
        //this.simplomat = null; // kw
        //this.view = null; // kw
    };
    this.changeView = function(view) {
        // TODO
        /* start kw */
        var textBoundary = this.getBoundary();
        var oldBoundary = this.view.boundary;
        var newBoundary = view.boundary;

        var left = textBoundary.x - oldBoundary.x;
        var right = (oldBoundary.x + oldBoundary.width) - (textBoundary.x + textBoundary.width);
        var top = textBoundary.y - oldBoundary.y;
        var bottom = (oldBoundary.y + oldBoundary.height) - (textBoundary.y + textBoundary.height);

        var scaleX = newBoundary.width / oldBoundary.width;
        var scaleY = newBoundary.height / oldBoundary.height;

        this.view = view;
        this.view.texts.push(this);
        if (this.view != this.view.product.currentView)
            this.hide();

        var newX = 0;
        var newY = 0;

        if (this.horizontalAlignment == "center") {
            newX = newBoundary.width / 2 + newBoundary.x - textBoundary.width / 2;
        } else if (this.horizontalAlignment == "left") {
            newX = newBoundary.x + left * scaleX;
        } else {
            newX = newBoundary.x + newBoundary.width - right * scaleX - textBoundary.width;
        }

        if (this.verticalAlignment == "center") {
            newY = newBoundary.height / 2 + newBoundary.y - textBoundary.height / 2;
        } else if (this.verticalAlignment == "top") {
            newY = newBoundary.y + top * scaleY;
        } else {
            newY = newBoundary.y + newBoundary.height - bottom * scaleY - textBoundary.height;
        }

        var boundaryOffsetX = (textBoundary.x - this.x) * scaleX;
        var boundaryOffsetY = (textBoundary.y - this.y) * scaleY;

        this.moveToPosition(newX-boundaryOffsetX, newY-boundaryOffsetY);
        /* end kw */
    };

    if (this.simplomat.editMode) {
        this.enableEdit();
    } else {
        this.disableEdit();
    }

    this.finalizeAction();
}

function TextLine(textString, font, fontSize, color, printColorId,
              x, y, textAnchor, text, simplomat) {
    this.text = text;
    this.simplomat = simplomat;

    this.textString = textString;
    this.font = font;
    this.fontSize = fontSize;
    this.color = color;
    this.printColorId = printColorId;
    this.textAnchor = textAnchor;
    this.x = x;
    this.y = y;

    this.textShapes = null;

    this.getFont = function() {
        return (font == null) ? this.text.font : font;
    };
    this.getFontSize = function() {
        return (fontSize == null) ? this.text.fontSize : fontSize;
    };
    this.getColor = function() {
        return (color == null) ? this.text.color : color;
    };
    this.getPrintColorId = function() {
        return (printColorId == null) ? this.text.printColorId : printColorId;
    };
    this.getTextAnchor = function() {
        return (textAnchor == null) ? this.text.textAnchor : textAnchor;
    };

    this.show = function() {
        for (var i = 0, ii = this.textShapes.length; i < ii; i++) {
            this.textShapes[i].show();
            this.textShapes[i].animate({x: this.textShapes[i].attr("x")});
        }
        this.simplomat.R.safari();
    };
    this.hide = function() {
        for (var i = 0, ii = this.textShapes.length; i < ii; i++) {
            this.textShapes[i].hide();
        }
        this.simplomat.R.safari();
    };
    this.enableEdit = function() {
        this.text.dragging = true;
        for (var i = 0, ii = this.textShapes.length; i < ii; i++) {
            this.textShapes[i].attr({cursor: "move"});
        }
    };
    this.disableEdit = function() {
        this.text.dragging = false;
        for (var i = 0, ii = this.textShapes.length; i < ii; i++) {
            this.textShapes[i].attr({cursor: "auto"});
        }
    };
     /**
     * Move to absolute x,y position.
     *
     * @param x
     * @param y
     */
    this.moveToPosition = function(x, y) {
        var deltaX = x - this.x;
        var deltaY = y - this.y;
        this.moveByDelta(deltaX, deltaY);
    };
    /**
     * Move to position on the printarea that is percentageX of print area width and
     * percentageY of print area height.
     *
     * @param percentageX
     * @param percentageY
     */
    this.moveToRelativePosition = function(percentageX, percentageY) {
        var bounds = this.getBoundary();
        var newX = this.text.view.boundary.x + this.text.view.boundary.width * percentageX / 100 - bounds.width/2;
        var newY = this.text.view.boundary.y + this.text.view.boundary.height * percentageY / 100 - bounds.height/2;
        this.moveToPosition(newX, newY);
    };
    /**
     * Move by given x and y values relative to current x,y coordinates.
     *
     * @param deltaX
     * @param deltaY
     */
    this.moveByDelta = function(deltaX, deltaY) {
        for (var i = 0, ii = this.textShapes.length; i < ii; i++) {
             this.textShapes[i].translate(deltaX, deltaY);
        }
        this.x += deltaX;
        this.y += deltaY;
    };
    this.getBoundary = function (zoom) {
        var firstBounds = this.textShapes[0].getBBox();
        var lastBounds = this.textShapes[this.textShapes.length-1].getBBox();
        var boundary = new Object();
        boundary.x = firstBounds.x;
        boundary.y = firstBounds.y;
        boundary.width = lastBounds.x + lastBounds.width - firstBounds.x;
        boundary.height = this.getFontSize();
        return boundary;
    };
    this.remove = function() {
         for (var i = 0, ii = this.textShapes.length; i < ii; i++) {
             this.textShapes[i].remove();
        }
    };

    this.textShapes = this.simplomat.R.print(this.x, this.y + this.getFontSize() / 2,
            textString, this.simplomat.R.getFont(this.getFont().name), this.getFontSize(), "left")
            .attr("fill", this.getColor());
    for (var i = 0, ii = this.textShapes.length; i < ii; i++) {
        this.textShapes[i].text = this.text;
        this.textShapes[i].drag(function (dx, dy) {
            if (this.text.dragging) {
                var dragX = dx - this.odx;
                var dragY = dy - this.ody;
                this.text.moveByDelta(dragX, dragY);
                this.odx = dx;
                this.ody = dy;
            }
        },
                function () {
                    if (this.text.dragging) {
                        this.ox = this.text.x;
                        this.oy = this.text.y;
                        this.odx = 0;
                        this.ody = 0;
                    }
                },
                function () {
                    if (this.text.dragging) {
                        // kw this.text.x = this.text.x + this.odx;
                        // kw this.text.y = this.text.y + this.ody;
                        this.text.finalizeAction();
                    }
                });
    }

    // TODO crazy fix - test with other fonts
    var boundary = this.getBoundary();
    this.textShapes.translate((this.x - boundary.x)*0.9, 0);
}

function PrintType(id, dpi, price, width, height, printColors) {
    this.id = id;
    this.dpi = dpi;
    this.price = price;
    this.width = width;
    this.height = height;
    this.printColors = printColors;

    this.getPrintColor = function(hex) {
        for (var i = 0; i < printColors.length; i++) {
            if (printColors[i].hex === hex) {
                return printColors[i];
            }
        }
        return null;
    };
    this.getPrintColorById = function(id) {
        for (var i = 0; i < printColors.length; i++) {
            if (printColors[i].id === id) {
                return printColors[i];
            }
        }
        return null;
    };
}

function PrintColor(id, hex, price) {
    this.id = id;
    this.hex = hex;
    this.price = price;
}

function Font(id, familyId, name, style, weight, minimumFontSize) {
    this.id = id;
    this.familyId = familyId;
    this.name = name;
    this.style = style;
    this.weight = weight;
    this.minimumFontSize = minimumFontSize;
}

// TODO 
var PixelMMConverter = {
    mmToPixel: function (value, dpi) {
        return value * (dpi != null ? dpi : 120) / 25.4;
    },
    pixelToMM: function (value, dpi) {
        return value * 25.4 / (dpi != null ? dpi : 120);
    }
};

var Rounder = {
    round: function(number) {
        return parseInt(number * 100) / 100;
    }
};

function PriceFormatter(format, decimalCount, centsSeparator, thousandsSeparator) {
    this.format = format;
    this.decimalCount = decimalCount;
    this.centsSeparator = centsSeparator;
    this.thousandsSeparator = thousandsSeparator;

    // format as price
    this.formatPrice = function(price, currency) {
        // formatting settings
        price = "" + price;

        // split integer from cents
        var centsVal = "";
        var integerVal = "0";
        if (price.indexOf('.') != -1) {
            centsVal = price.substring(price.indexOf('.') + 1, price.length);
            integerVal = price.substring(0, price.indexOf('.'));
        } else {
            integerVal = price;
        }

        var formatted = "";

        var count = 0;
        for (var j = integerVal.length - 1; j >= 0; j--) {
            var character = integerVal.charAt(j);
            count++;
            if (count % 3 == 0)
                formatted = (this.thousandsSeparator + character) + formatted;
            else
                formatted = character + formatted;
        }
        if (formatted.indexOf(0) == this.thousandsSeparator)
            formatted = formatted.substring(1, formatted.length);

        formatted += this.centsSeparator;

        for (var j = 0; j < this.decimalCount; j++) {
            if (j < centsVal.length) {
                formatted += "" + centsVal.charAt(j);
            } else {
                formatted += "0";
            }
        }

        var out = this.format;
        out = out.replace('%', formatted);
        out = out.replace('$', currency);
        return out;
    };
}

function Path(scaleFactor) {
    this.scaleFactor = scaleFactor;
    this.path = "";
    this.M = function (x, y) {
        this.path += "M" + x * scaleFactor + "," + y * scaleFactor;
        return this;
    };
    this.L = function (x, y) {
        this.path += "L" + x * scaleFactor + "," + y * scaleFactor;
        return this;
    };
    this.l = function (x, y) {
        this.path += "l" + x * scaleFactor + "," + y * scaleFactor;
        return this;
    };
    this.C = function (x1, y1, x2, y2, x3, y3) {
        this.path += "C" + x1 * scaleFactor + "," + y1 * scaleFactor + "," + x2 * scaleFactor + "," + y2 * scaleFactor + "," + x3 * scaleFactor + "," + y3 * scaleFactor;
        return this;
    };
    this.c = function (x1, y1, x2, y2, x3, y3) {
        this.path += "c" + x1 * scaleFactor + "," + y1 * scaleFactor + "," + x2 * scaleFactor + "," + y2 * scaleFactor + "," + x3 * scaleFactor + "," + y3 * scaleFactor;
        return this;
    };
    this.Z = function () {
        this.path += "Z";
        return this;
    };
}

Function.prototype.andThen = function(g) {
    var f = this;
    return function() {
        f();
        g();
    };
};
