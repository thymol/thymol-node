/*-------------------- Thymol - the flavour of Thymeleaf --------------------*

   Thymol version 2.0.1-pre.7 Copyright (C) 2012-2020 James J. Benson
   jjbenson .AT. users.sf.net (http://www.thymoljs.org/)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" basis,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either expressed or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 *---------------------------------------------------------------------------*/


thymol = function() {
    const ELEMENT_NODE = 1;
    const TEXT_NODE = 3;
    const COMMENT_NODE = 8;
    const DOCUMENT_NODE = 9;
    const DOCUMENT_TYPE_NODE = 10;
    const DOCUMENT_FRAGMENT_NODE = 11;
    const FILTER_ACCEPT = 1;
    const FILTER_REJECT = 2;
    const SHOW_ALL = -1;
    const SHOW_TEXT = 4;
    const SHOW_COMMENT = 128;
    thymol.thVersion = "2.0.1-pre.7";
    thymol.thReleaseDate = "not yet!";
    thymol.thURL = "http://www.thymoljs.org";
    thymol.thAltURL = "http://www.thymeleaf.org";
    thymol.thUsingNullPrefix = false;
    thymol.thThymeleafPrefixList = [];
    thymol.thDisabledList = [];
    thymol.thThymeleafElementsList = [];
    thymol.objects = {};
    thymol.varParExpr = /([^(]*)\s*[(]([^)]*?)[)]/;
    const varRefExpr = /([$#]{.*?})/, literalTokenExpr = /^[a-zA-Z0-9\[\]\.\-_]*$/, startParserLevelCommentExpr = /^\s*\/\*\s*$/, endParserLevelCommentExpr = /^\s*\*\/\s*$/, startParserLevelCommentExpr2 = /^\/\*[^\/].*/, endParserLevelCommentExpr2 = /.*[^\/]\*\/$/, prototypeOnlyCommentEscpExpr = /\/\*\/(.*)\/\*\//, varExpr3 = /[^\$\*#@]{1}\{(.*)\}$/, nonURLExpr = /[\$\*#]{1}\{(?:!?[^}]*)\}/, numericExpr = /^[+\-]?[0-9]*?[.]?[0-9]*?$/, domSelectExpr = /([\/]{1,2})?([A-Za-z0-9_\-]*(?:[\(][\)])?)?([^\[]\S[A-Za-z0-9_\-]*(?:[\(][\)])?[\/]*(?:[\.\/#]?[^\[]\S[A-Za-z0-9_\-]*(?:[\(][\)])?[\/]*)*)?([\[][^\]]*?[\]])?/, litSubstExpr = /\.*?([\|][^\|]*?[\|])\.*?/;
    function Thymol() {}
    function isClientSide() {
        if (typeof thymol.isServerSide !== "undefined" && !!thymol.isServerSide()) {
            thymol.isClientSide = function() {
                return false;
            };
            return false;
        }
        thymol.isClientSide = function() {
            return true;
        };
        return true;
    }
    function execute(doc) {
        if (typeof thymol.protocol === "undefined") {
            thymol.protocol = "";
        }
        if (typeof thymol.root === "undefined") {
            thymol.root = "";
        }
        if (typeof thymol.path === "undefined") {
            thymol.path = "";
        }
        thymol.thDocument = doc;
        var theWindow = thymol.thWindow;
        if (typeof thymol.thWindow === "undefined") {
            if (typeof doc.defaultView !== "undefined") {
                theWindow = doc.defaultView;
            } else if (typeof doc.parentWindow !== "undefined") {
                theWindow = doc.parentWindow;
            }
        }
        thymol.thWindow = theWindow;
        var theTop = thymol.thTop;
        if (typeof thymol.thTop === "undefined") {
            if (typeof top !== "undefined") {
                theTop = top;
            }
        }
        thymol.thTop = theTop;
        thymol.init();
        Thymol.prototype.process(thymol.thDocument);
        postExecute();
        return thymol.thDocument;
    }
    function reset() {
        thymol.thFileCache = {};
        thymol.thFragmentCache = {};
        var accessor = undefined, i, iLimit, j, jLimit;
        if (typeof thVars !== "undefined") {
            delete thVars;
        }
        thVars = [];
        accessor = new thymol.ThVarsAccessor(thVars, "thVars");
        if (typeof thDisable !== "undefined") {
            delete thDisable;
        }
        if (!!thymol.applicationContext) {
            delete thymol.applicationContext;
        }
        thymol.applicationContext = thymol.makeContext("application", accessor);
        if (!!thymol.booleanAndNullTokens) {
            delete thymol.booleanAndNullTokens;
        }
        thymol.booleanAndNullTokens = new Array();
        thymol.booleanAndNullTokens["null"] = thymol.applicationContext.createVariable("null", null);
        thymol.booleanAndNullTokens["true"] = thymol.applicationContext.createVariable("true", true);
        thymol.booleanAndNullTokens["false"] = thymol.applicationContext.createVariable("false", false);
        var theTop = thymol.thTop;
        if (typeof thymol.thTop === "undefined") {
            if (typeof top !== "undefined") {
                theTop = top;
            }
        }
        thymol.thTop = theTop;
        if (!!thymol.sessionContext) {
            delete thymol.sessionContext;
        }
        thymol.sessionContext = thymol.makeContext("session", undefined);
        thymol.sessionContext.persist = function() {
            var save = thymol.sessionContext.serialise();
            thymol.thTop.name = save;
        };
        if (!!thymol.requestContext) {
            delete thymol.requestContext;
        }
        thymol.requestContext = thymol.makeContext("request", undefined);
        thymol.thExpressionObjects = {};
        thymol.thExpressionObjects["#object"] = {};
        thymol.thExpressionObjects["#locale"] = {};
        thymol.thExpressionObjects["#ctx"] = [];
        thymol.thExpressionObjects["#ctx"]["variables"] = thymol.applicationContext;
        thymol.thExpressionObjects["#ctx"]["servletContext"] = thymol.applicationContext;
        thymol.thExpressionObjects["#vars"] = thymol.applicationContext;
        thymol.thExpressionObjects["#root"] = thymol.applicationContext;
        thymol.configureModule(thymol.objects.thHttpServletRequestObject);
        thymol.configureModule(thymol.objects.thHttpSessionObject);
        if (typeof thymol.thObjectsConfigureModules !== "undefined") {
            thymol.thObjectsConfigureModules();
        }
        thymol.thExpressionObjects["#ctx"]["httpServletRequest"] = thymol.thExpressionObjects["#httpServletRequest"];
        thymol.thExpressionObjects["#ctx"]["httpSession"] = thymol.thExpressionObjects["#httpSession"];
        var dLength = thymol.thDisabledList.length;
        if (dLength > 0) {
            for (i = 0; i < dLength; i++) {
                thymol.thDisabledList[i].reEnable();
            }
            thymol.thDisabledList = [];
        }
    }
    function setup() {
        reset();
        thymol.prefix = Thymol.prototype.getThParam("thPrefix", false, false, thymol.thDefaultPrefix);
        thymol.dataPrefix = Thymol.prototype.getThParam("thDataPrefix", false, false, thymol.thDefaultDataPrefix);
        thymol.thInclude = new thymol.ThAttr("include", Thymol.prototype.processImport, 100, thymol.thThymeleafPrefixList, thymol.prefix);
        thymol.thReplace = new thymol.ThAttr("replace", Thymol.prototype.processImport, 100, thymol.thThymeleafPrefixList, thymol.prefix);
        thymol.thSubstituteby = new thymol.ThAttr("substituteby", Thymol.prototype.processImport, 100, thymol.thThymeleafPrefixList, thymol.prefix);
        thymol.thFragment = new thymol.ThAttr("fragment", function() {}, 1500, thymol.thThymeleafPrefixList, thymol.prefix);
        thymol.thRemove = null;
        thymol.thBlock = new thymol.ThElement("block", function(element) {
            var i, limit = element.childNodes.length;
            for (i = 0; i < limit; i++) {
                if (element.childNodes[i].nodeType === ELEMENT_NODE) {
                    element.childNodes[i].isBlockChild = true;
                }
            }
        }, thymol.prefix);
        thymol.setupAttrList();
        thymol.thDeferredFunctions = [];
        thymol.thPreExecutionFunctions = [];
        thymol.thPostExecutionFunctions = [];
    }
    function ready(func) {
        if (typeof thymolDeferredFunctions === "undefined" || thymolDeferredFunctions === null) {
            thymolDeferredFunctions = [];
        }
        thymolDeferredFunctions.push(func);
    }
    function setupEnv() {
        thymol.messagePath = Thymol.prototype.getThParam("thMessagePath", false, true, thymol.thDefaultMessagePath);
        thymol.resourcePath = Thymol.prototype.getThParam("thResourcePath", false, true, thymol.thDefaultResourcePath);
        thymol.messagesBaseName = Thymol.prototype.getThParam("thMessagesBaseName", false, false, thymol.thDefaultMessagesBaseName);
        thymol.relativeRootPath = Thymol.prototype.getThParam("thRelativeRootPath", false, true, thymol.thDefaultRelativeRootPath);
        thymol.extendedMapping = Thymol.prototype.getThParam("thExtendedMapping", true, false, thymol.thDefaultExtendedMapping);
        thymol.localMessages = Thymol.prototype.getThParam("thLocalMessages", true, false, thymol.thDefaultLocalMessages);
        thymol.disableMessages = Thymol.prototype.getThParam("thDisableMessages", true, false, thymol.thDefaultDisableMessages);
        thymol.templateSuffix = Thymol.prototype.getThParam("thTemplateSuffix", false, false, thymol.thDefaultTemplateSuffix);
        thymol.inlineQuote = Thymol.prototype.getThParam("thDefaultInlineQuote", false, false, thymol.thDefaultInlineQuote);
        thymol.scriptPath = "";
        if (typeof thymol.thScriptPath !== "undefined") {
            thymol.scriptPath = Thymol.prototype.getThParam("thScriptPath", false, true, thymol.thScriptPath);
        }
        thymol.absolutePath = "";
        if (typeof thymol.thAbsolutePath !== "undefined") {
            thymol.absolutePath = Thymol.prototype.getThParam("thAbsolutePath", false, true, thymol.thAbsolutePath);
        }
        thymol.useAbsolutePath = false;
        if (typeof thymol.thUseAbsolutePath !== "undefined") {
            thymol.useAbsolutePath = Thymol.prototype.getThParam("thUseAbsolutePath", true, false, thymol.thUseAbsolutePath);
        }
        thymol.useFullURLPath = true;
        if (typeof thymol.thUseFullURLPath !== "undefined") {
            thymol.useFullURLPath = Thymol.prototype.getThParam("thUseFullURLPath", true, false, thymol.thUseFullURLPath);
        }
        thymol.indexFile = Thymol.prototype.getThParam("thIndexFile", false, false, null);
        thymol.debug = Thymol.prototype.getThParam("thDebug", true, false, false);
        thymol.allowNullText = Thymol.prototype.getThParam("thAllowNullText", true, false, true);
        thymol.location = thymol.thLocation;
        if ("" !== thymol.relativeRootPath) {
            thymol.root = thymol.location + thymol.relativeRootPath;
            thymol.messagePath = thymol.root + thymol.messagePath;
        } else {
            if (typeof thymol.thMessagePath !== "undefined") {
                thymol.messagePath = Thymol.prototype.getThParam("thMessagePath", false, true, thymol.thMessagePath);
            }
            if (typeof thymol.thRoot !== "undefined") {
                thymol.root = Thymol.prototype.getThParam("thRoot", false, true, thymol.thRoot);
            }
        }
        thymol.root = Thymol.prototype.getThParam("thRoot", false, true, thymol.root);
        if (typeof thymol.thPath !== "undefined") {
            thymol.path = Thymol.prototype.getThParam("thPath", false, true, thymol.thPath);
        }
        thymol.path = Thymol.prototype.getThParam("thPath", false, true, thymol.path);
        thymol.protocol = thymol.thDocument.location.protocol;
        if ("" == thymol.protocol) {
            thymol.protocol = thymol.thDefaultProtocol;
        } else {
            thymol.protocol += "//";
            if ("" == thymol.thDocument.location.host) {
                thymol.protocol += "/";
            }
        }
        thymol.protocol = Thymol.prototype.getThParam("thProtocol", false, false, thymol.protocol);
        thymol.resourcePath = Thymol.prototype.getThParam("thResourcePath", false, true, thymol.resourcePath);
    }
    function updatePrefix(pref) {
        if (thymol.prefix !== pref) {
            var newPref = pref + ":";
            var newEscpPref = pref + "\\:";
            var newSynonymPref = "data-" + pref + "-";
            var current = thymol.thThymeleafPrefixList[thymol.prefix];
            for (j = 0, jLimit = current.length; j < jLimit; j++) {
                var suffix1 = current[j].suffix;
                current[j].name = newPref + suffix1;
                current[j].escpName = "[" + newEscpPref + suffix1 + "]";
                current[j].synonym = newSynonymPref + suffix1;
                current[j].escpSynonym = "[" + current[j].synonym + "]";
            }
            var current = thymol.thThymeleafElementsList;
            for (j = 0, jLimit = current.length; j < jLimit; j++) {
                var splits = current[j].name.split(":");
                var suffix2 = splits[1];
                current[j].name = newPref + suffix2;
                current[j].endName = "/" + current[j].name;
                current[j].synonym = newSynonymPref + suffix2;
                current[j].endSynonym = "/" + current[j].synonym;
            }
            thymol.thThymeleafPrefixList[pref] = thymol.thThymeleafPrefixList[thymol.prefix];
            thymol.thThymeleafPrefixList[newSynonymPref] = thymol.thThymeleafPrefixList[thymol.prefix];
            var oldPref = thymol.prefix + ":";
            var oldSynonymPref = "data-" + thymol.prefix + "-";
            delete thymol.thThymeleafPrefixList[thymol.prefix];
            delete thymol.thThymeleafPrefixList[oldSynonymPref];
            for (j = 0, jLimit = thymol.thThymeleafPrefixList.length; j < jLimit; j++) {
                if (thymol.thThymeleafPrefixList[j] === oldPref) {
                    thymol.thThymeleafPrefixList[j] = newPref;
                } else if (thymol.thThymeleafPrefixList[j] === oldSynonymPref) {
                    thymol.thThymeleafPrefixList[j] = newSynonymPref;
                }
            }
            thymol.prefix = pref;
            thymol.applicationContext.createVariable("thPrefix", pref);
        }
    }
    function init() {
        thymol.messages = null;
        thymol.mappings = null;
        thymol.debug = null;
        getLocations(this);
        thymol.locale = new thymol.ThObject();
        getLanguage();
        thymol.allowNullText = null;
        setupEnv();
        if (typeof thymol.thDataThymolLoading === "undefined" || thymol.thDataThymolLoading === null || !!thymol.thDataThymolLoading) {
            var scripts = thymol.thDocument.getElementsByTagName("script");
            for (var i = 0, iLimit = scripts.length; i < iLimit; i++) {
                var parameters = scripts[i].getAttribute("data-thymol-load");
                if (!!parameters) {
                    var splits = parameters.split(",");
                    for (var j = 0, jLimit = splits.length; j < jLimit; j++) {
                        loadScript(splits[j]);
                    }
                }
            }
            var newPrefix = Thymol.prototype.getThParam("thPrefix", false, false, thymol.prefix);
            thymol.updatePrefix(newPrefix);
        }
        setupEnv();
        executeDeferred();
        if (!(typeof thVars === "undefined")) {
            for (i = 0, iLimit = thVars.length; i < iLimit; i++) {
                thymol.applicationContext.createVariable(thVars[i][0], thVars[i][1]);
            }
        }
        (function() {
            var htmlTag = thymol.thDocument.getElementsByTagName("html")[0];
            var htmlTagAttrs = htmlTag.attributes, tp = null, tu, nsspec;
            var urls = [ thymol.thURL, thymol.thAltURL ];
            for (var i = 0, iLimit = urls.length; i < iLimit; i++) {
                for (var j = 0, jLimit = htmlTagAttrs.length; j < jLimit; j++) {
                    var ta = htmlTagAttrs.item(j);
                    if (urls[i] == ta.value) {
                        nsspec = ta.localName.split(":");
                        if (nsspec.length > 0) {
                            tp = nsspec[nsspec.length - 1];
                            break;
                        }
                    }
                }
                if (tp) {
                    thymol.updatePrefix(tp);
                    break;
                }
            }
        })();
        var defaultScriptUrl = "";
        if (!!thymol.thRequest) {
            thymol.thWindow.location.search = thymol.thRequest;
        }
        (function(app, req) {
            var surl, scriptUrl = defaultScriptUrl;
            var scripts = thymol.thDocument.getElementsByTagName("script");
            for (var i = 0, iLimit = scripts.length; i < iLimit; i++) {
                var surl = scripts[i].src;
                if (surl.indexOf(thymol.thScriptName) >= 0) {
                    scriptUrl = doDecode(surl);
                    break;
                }
            }
            setFromURL(app, scriptUrl);
            setFromURL(req, thymol.thWindow.location.href, true);
        })(thymol.applicationContext, thymol.requestContext);
        thymol.applicationContext.resolveJSONReferences();
        preExecute(thymol.applicationContext);
        thymol.sessionContext.init();
        thymol.sessionContext.resolveJSONReferences();
        thymol.requestContext.resolveJSONReferences();
        thymol.thExpressionObjects["#ctx"]["requestParameters"] = thymol.requestContext;
        thymol.protocol = Thymol.prototype.override("thProtocol", thymol.protocol);
        thymol.debug = Thymol.prototype.override("thDebug", thymol.debug);
        thymol.root = Thymol.prototype.override("thRoot", thymol.root);
        if ("" !== thymol.relativeRootPath) {
            var rootURI = thymol.thDocument.location.href;
            var quePos = rootURI.indexOf("?");
            if (quePos >= 0) {
                rootURI = rootURI.substring(0, quePos);
            }
            var sepPos = rootURI.lastIndexOf("/");
            if (sepPos >= 0) {
                rootURI = rootURI.substring(0, sepPos + 1);
            }
            var newThRoot = rootURI + thymol.thLocation + thymol.relativeRootPath;
            thymol.thRoot = Thymol.prototype.getThParam("thRoot", false, true, newThRoot);
        }
        thymol.path = Thymol.prototype.override("thPath", thymol.path);
        thymol.allowNullText = Thymol.prototype.override("thAllowNullText", thymol.allowNullText);
        thymol.locale.value = Thymol.prototype.override("thLocale", thymol.locale.value);
        if (!(typeof thMappings === "undefined")) {
            thymol.mappings = [];
            for (j = 0, jLimit = thMappings.length; j < jLimit; j++) {
                thymol.mappings.push([ thMappings[j][0], thMappings[j][1] ]);
            }
            thymol.mappings.sort(function(a, b) {
                return a[0].length > b[0].length ? -1 : 1;
            });
        }
        thymol.messages = {};
        setLocaleValue();
        if (!(typeof thMessages === "undefined")) {
            thymol.messages[""] = [];
            for (j = 0, jLimit = thMessages.length; j < jLimit; j++) {
                thymol.messages[""][thMessages[j][0]] = thMessages[j][1];
            }
            for (var k in thMessages) {
                if (thMessages.hasOwnProperty(k)) {
                    if (!k.match(numericExpr)) {
                        thymol.messages[k] = [];
                        for (j = 0, jLimit = thMessages[k].length; j < jLimit; j++) {
                            thymol.messages[k][thMessages[k][j][0]] = thMessages[k][j][1];
                        }
                    }
                }
            }
        }
        if (!(typeof thDisable === "undefined")) {
            for (j = 0, jLimit = thDisable.length; j < jLimit; j++) {
                Thymol.prototype.doDisable(thDisable[j]);
            }
        }
        thymol.thRemove = Thymol.prototype.getThAttrByName("remove");
    }
    function doDecode(s) {
        return decodeURIComponent(s.replace(/\+/g, " "));
    }
    function setFromURL(ctx, url, isReq) {
        var pq = url.indexOf("?");
        if (pq > 0) {
            var rem = url.substring(pq + 1);
            if (!!rem) {
                var parts = rem.split("&");
                for (j = 0, jLimit = parts.length; j < jLimit; j++) {
                    var pair = parts[j].split("=");
                    if (pair.length > 1) {
                        setControl(ctx, doDecode(pair[0]), doDecode(pair[1]), isReq);
                    }
                }
            }
        }
    }
    function setControl(ctx, name, value, isReq) {
        switch (name) {
          case "thPrefix":
            updatePrefix(value);
            break;

          case "thDataPrefix":
            thymol.dataPrefix = setThParam(name, value);
            break;

          case "thMessagePath":
            thymol.messagePath = setThParam(name, value);
            break;

          case "thResourcePath":
            thymol.resourcePath = setThParam(name, value);
            break;

          case "thMessagesBaseName":
            thymol.messagesBaseName = setThParam(name, value);
            break;

          case "thRelativeRootPath":
            thymol.relativeRootPath = setThParam(name, value);
            break;

          case "thExtendedMapping":
            thymol.extendedMapping = setThParam(name, getBooleanValue(value));
            break;

          case "thTemplateSuffix":
            thymol.templateSuffix = setThParam(name, value);
            break;

          case "thInlineQuote":
            thymol.inlineQuote = setThParam(name, value);
            break;

          case "thLocalMessages":
            thymol.localMessages = setThParam(name, getBooleanValue(value));
            break;

          case "thDisableMessages":
            thymol.disableMessages = setThParam(name, getBooleanValue(value));
            break;

          case "thIndexFile":
            thymol.indexFile = setThParam(name, value);
            break;

          case "thProtocol":
            thymol.protocol = setThParam(name, value);
            break;

          case "thDebug":
            thymol.debug = setThParam(name, getBooleanValue(value));
            break;

          case "thRoot":
            thymol.root = setThParam(name, value);
            break;

          case "thPath":
            thymol.path = setThParam(name, value);
            break;

          case "thAllowNullText":
            thymol.allowNullText = setThParam(name, getBooleanValue(value));
            break;

          case "thLocale":
            thymol.locale.value = setThParam(name, value);
            break;

          case "thDefaultPrecision":
            thymol.thDefaultPrecision = setThParam(name, value);
            break;

          case "thDefaultPrecedence":
            thymol.thDefaultPrecedence = setThParam(name, value);
            break;

          default:
            {
                if (name.startsWith("thymol.")) {
                    var endw = name.substring(7);
                    if (thymol.hasOwnProperty(endw)) {
                        thymol[endw] = value;
                    }
                } else {
                    ctx.createVariable(name, value, isReq);
                }
            }
        }
    }
    function setThParam(name, value) {
        var thp = thymol.applicationContext[name];
        thp.value = value;
        return value;
    }
    function getLocations(thiz) {
        thiz.templateName = "";
        thiz.templatePath = "";
        if (!!thymol.thDocument.location.href) {
            var templateName = templatePath = thymol.thDocument.location.href;
            thiz.templateName = templateName.substring(0, templateName.indexOf(".") == -1 ? templateName.length : templateName.lastIndexOf("."));
            thiz.templatePath = templatePath.substring(0, templatePath.indexOf("/") == -1 ? 0 : templatePath.lastIndexOf("/") + 1);
        }
    }
    function getCtx() {
        return thymol.thExpressionObjects["#ctx"];
    }
    function configureModule(module) {
        if (typeof thymol.thExpressionObjects === "undefined" || thymol.thExpressionObjects === null) {
            thymol.thExpressionObjects = {};
        }
        thymol.thExpressionObjects[module.thExpressionObjectName] = module;
    }
    function configureAttributeProcessor(prefix, suffix, func, prec, override, dataAttr) {
        var p = prefix + ":";
        if (p !== null) {
            if (thymol.thThymeleafPrefixList.indexOf(p) < 0) {
                thymol.thThymeleafPrefixList.push(p);
            }
        } else {
            thymol.thUsingNullPrefix = true;
        }
        if (!!override) {
            var attrList = thymol.thThymeleafPrefixList[prefix];
            var i, iLimit = attrList.length;
            for (i = 0; i < iLimit; i++) {
                if (suffix === attrList[i].suffix) {
                    attrList.splice(i, 1);
                    break;
                }
            }
        }
        p = new thymol.ThAttr(suffix, func, prec, thymol.thThymeleafPrefixList, prefix, dataAttr);
    }
    function configureElementProcessor(prefix, suffix, func) {
        var p = new thymol.ThElement(suffix, func, prefix);
    }
    function configurePreExecution(func) {
        thymol.thPreExecutionFunctions.push(func);
    }
    function configurePostExecution(func) {
        thymol.thPostExecutionFunctions.push(func);
    }
    function executeDeferred() {
        if (typeof thymolDeferredFunctions !== "undefined" && thymolDeferredFunctions !== null) {
            while (thymolDeferredFunctions.length > 0) {
                var func = thymolDeferredFunctions.pop();
                func();
            }
        }
    }
    function preExecute(context) {
        while (thymol.thPreExecutionFunctions.length > 0) {
            var func = thymol.thPreExecutionFunctions.pop();
            func();
            context.resolveJSONReferences();
        }
    }
    function postExecute() {
        while (thymol.thPostExecutionFunctions.length > 0) {
            var func = thymol.thPostExecutionFunctions.pop();
            func();
        }
    }
    function preProcess(expr, element) {
        var result = expr, fp, lp;
        do {
            fp = result.indexOf("__");
            if (fp >= 0) {
                lp = -1;
                if (result.length > 4) {
                    lp = result.lastIndexOf("__");
                }
                if (lp <= 0) {
                    thymol.error(true, "Mismatched pre-processing indicators", element);
                }
                var head = result.substring(0, fp);
                var centre = result.substring(fp + 2, lp);
                centre = thymol.getParsedExpr(centre, element);
                var tail = result.substring(lp + 2);
                result = head + centre + tail;
                fp = result.indexOf("__");
            }
        } while (fp >= 0);
        result = result.replace(/\\_\\_/g, "__");
        return result;
    }
    function substituteParam(argValue, mode, element) {
        var result = argValue, varName = argValue, subs = null, msg, expo;
        if (result) {
            if (mode === 4) {
                msg = thymol.getMessage(varName);
                if (msg) {
                    subs = msg;
                }
            } else if (mode === 6) {
                subs = argValue;
            } else {
                var token = thymol.booleanAndNullTokens[result];
                if (!(typeof token === "undefined")) {
                    if (token === null) {
                        subs = null;
                    } else {
                        subs = token.value;
                    }
                } else {
                    if (varName.charAt(0) === "#") {
                        if ("#object" === varName) {
                            if (element.thObjectVar) {
                                subs = element.thObjectVar;
                            }
                        } else {
                            expo = thymol.thExpressionObjects[varName];
                            if (typeof expo !== "undefined" && expo !== null) {
                                subs = expo;
                            }
                        }
                    }
                    if ((typeof subs === "undefined" || subs == null) && element.thObjectVar) {
                        subs = element.thObjectVar[varName];
                    }
                    if ((typeof subs === "undefined" || subs == null) && element.thLocalVars) {
                        subs = element.thLocalVars[varName];
                    }
                    if (typeof subs === "undefined" || subs == null) {
                        subs = thymol.ThUtils.getParameter(varName);
                    }
                    if (typeof subs === "undefined" || subs == null) {
                        if ("param" === varName) {
                            subs = thymol.requestContext;
                        }
                        if ("session" === varName) {
                            subs = thymol.sessionContext;
                        }
                        if ("application" === varName) {
                            subs = thymol.applicationContext;
                        }
                    }
                    if (mode === 2 && (typeof subs === "undefined" || subs == null)) {
                        subs = argValue;
                    }
                }
            }
            result = subs;
            if (subs instanceof thymol.ThParam) {
                result = subs.value;
            }
        }
        return result;
    }
    function getStandardURL(initial) {
        var result = initial.trim(), mapped, head;
        mapped = thymol.getMapped(result, thymol.extendedMapping);
        if (mapped) {
            result = mapped;
        }
        if ("/" === result && !!thymol.indexFile) {
            result += thymol.indexFile;
        }
        if (!/.*:\/\/.*/.test(result)) {
            if (/^~?\/.*$/.test(result)) {
                if (/^~.*$/.test(result)) {
                    result = result.substring(1);
                }
                if (!/^\/\/.*$/.test(result)) {
                    if (thymol.useFullURLPath) {
                        head = thymol.root + thymol.resourcePath;
                        if (head != "") {
                            if (head.charAt(head.length - 1) !== "/") {
                                head = head + "/";
                            }
                            if (result.charAt(0) === "/") {
                                result = head + result.substring(1);
                            } else {
                                result = head + result;
                            }
                        }
                    } else {
                        result = thymol.resourcePath + result;
                    }
                }
            }
        }
        return result;
    }
    function getExpression(argValue, element) {
        var result = argValue, subst = false, initial, shortCut, args, negate, token, lsp;
        if (typeof argValue === "string") {
            initial = argValue.trim();
            result = initial;
            if (result) {
                shortCut = thymol.ThUtils.getParameter(result);
                if (!shortCut) {
                    args = result.match(varExpr3);
                    if (args) {
                        if (args[1] && args[1].length > 0) {
                            shortCut = thymol.ThUtils.getParameter(args[1]);
                        }
                    }
                }
                if (shortCut) {
                    if (shortCut instanceof thymol.ThParam) {
                        result = shortCut.value;
                    } else {
                        result = shortCut;
                    }
                    if (typeof result === "string" && result.match(numericExpr)) {
                        result = parseInt(result);
                    }
                } else {
                    initial = thymol.ThUtils.unParenthesise(result);
                    negate = false;
                    if (initial.charAt(0) == "!") {
                        negate = true;
                        initial = initial.substring(1, initial.length);
                        initial = thymol.ThUtils.unParenthesise(initial);
                    }
                    if (literalTokenExpr.test(initial)) {
                        token = thymol.booleanAndNullTokens[initial];
                        if (!(typeof token === "undefined")) {
                            result = token.value;
                            subst = true;
                        }
                    }
                    lsp = null;
                    if (!subst) {
                        lsp = initial.match(litSubstExpr);
                        if (lsp && lsp.length > 0) {
                            if (thymol.ThUtils.charOcurrences(lsp[1], "'") < 2) {
                                initial = Thymol.prototype.doLiteralSubstExpr(initial, lsp[1]);
                            }
                        }
                        result = "";
                        if (initial != "") {
                            initial = thymol.ThUtils.unParenthesise(initial);
                            initial = thymol.preProcess(initial, element);
                            result = thymol.getParsedExpr(initial, element, true);
                        }
                    }
                    if (result == initial && typeof result == typeof initial) {
                        result = null;
                    } else if (typeof result === "string") {
                        if (!lsp) {
                            result = result.replace(/[\\][\\]/g, "\\");
                        }
                        result = result.replace(/&#39;/g, "'").replace(/&apos;/gi, "'");
                    }
                    if (negate) {
                        if (typeof result === "boolean") {
                            result = !result;
                        } else if (typeof result === "number") {
                            result = result == 0;
                        } else if (typeof result === "string") {
                            result = !thymol.ThUtils.testLiteralFalse(result);
                        }
                    }
                }
            }
        }
        return result;
    }
    function getMapped(uri, extended) {
        var mapped = null, i, iLimit, key;
        if (uri && typeof uri === "string") {
            if (thymol.mappings) {
                for (i = 0, iLimit = thymol.mappings.length; i < iLimit; i++) {
                    key = thymol.mappings[i][0];
                    if (uri == key) {
                        mapped = thymol.mappings[i][1];
                        break;
                    } else if (extended) {
                        if (uri.indexOf(key) == 0) {
                            mapped = uri.substring(key.length);
                            mapped = thymol.mappings[i][1] + mapped;
                            break;
                        }
                    }
                }
            }
        }
        return mapped;
    }
    function substitute(initial, element, lenient) {
        var argValue = initial, result, args, token, re, subs, saved;
        if (typeof argValue === "string") {
            argValue = argValue.trim();
        }
        result = argValue;
        args = "";
        while (args != null) {
            args = argValue.match(/.*([$\*#@]{(!?[^}]*)}).*/);
            if (args != null && args.length > 0) {
                if (args.length == 3) {
                    token = args[1];
                    token = token.replace(/[$]/g, "[$]").replace(/[*]/g, "[*]").replace(/[\']/g, "[']").replace(/[+]/g, "[+]").replace(/[\(]/g, "[(]").replace(/[\)]/g, "[)]");
                    re = new RegExp(token);
                    subs = thymol.getExpression(args[2], element);
                    if (subs != args[2]) {
                        result = result.replace(re, subs, "g");
                        if (result == "null") {
                            result = null;
                        }
                    } else {
                        subs = "";
                        if (!lenient) {
                            thymol.error(false, 'variable substitution failed: "' + initial + '"', element);
                        }
                    }
                    saved = argValue;
                    argValue = argValue.replace(re, subs, "g");
                    if (saved == argValue) {
                        argValue = "";
                    }
                }
            }
        }
        var splits = result.split("+");
        if (splits.length > 1) {
            var line = "";
            for (var i = 0, iLimit = splits.length; i < iLimit; i++) {
                argValue = thymol.ThUtils.unQuote(splits[i]);
                line += argValue;
            }
            result = line;
        }
        return result;
    }
    function getWith(element, content) {
        var argValue = content.trim(), argCount = 0;
        if (argValue) {
            do {
                var argsExpr = thymol.ThParser.parse(argValue, true, false);
                var identifier = argsExpr.tokens.shift();
                if (identifier.type_ === 3) {
                    var result = argsExpr.evaluate(element);
                    var varName = identifier.index_;
                    if (!!varName) {
                        argCount++;
                        if (!element.thLocalVars) {
                            element.thLocalVars = {};
                        }
                        element.thLocalVars[varName] = result;
                    }
                    argValue = argValue.substring(argsExpr.position);
                } else {
                    break;
                }
            } while (argValue.length > 0);
        }
        return argCount;
    }
    function getParsedExpr(initial, element, preprocessed) {
        var expr, result = initial;
        expr = thymol.ThParser.parse(result, false, preprocessed);
        expr = expr.simplify();
        result = expr.evaluate(element);
        if (typeof result === "number") {
            result = thymol.ThUtils.getToPrecision(result, expr.precision);
        }
        return result;
    }
    function getBooleanValue(param) {
        var flag = false, val, args;
        if (param != null) {
            if (typeof param === "boolean") {
                flag = param;
            } else if (typeof param === "number") {
                flag = param != 0;
            } else {
                val = param;
                if (Object.prototype.toString.call(val) === "[object Array]") {
                    if (val.length === 1) {
                        val = val[0];
                    } else {
                        val = true;
                    }
                }
                if (typeof val === "boolean") {
                    flag = val;
                } else if (typeof val === "number") {
                    flag = val != 0;
                } else if (typeof val === "string") {
                    args = val.match(nonURLExpr);
                    if (args) {
                        val = args[1];
                        flag = this.testParam(val);
                    } else {
                        flag = !thymol.ThUtils.testLiteralFalse(val);
                    }
                } else if (val instanceof thymol.ThParam) {
                    flag = val.getBooleanValue();
                } else {
                    flag = typeof val !== "undefined" && val !== null;
                }
            }
        }
        return flag;
    }
    function isFragmentChild(element) {
        var result = false, parent = element.parentElement;
        while (parent) {
            if (parent.getAttribute(thymol.thFragment.name) || parent.getAttribute(thymol.thFragment.synonym)) {
                result = true;
                break;
            }
            parent = parent.parentElement;
        }
        return result;
    }
    function setLocale(locValue) {
        thymol.locale.value = locValue;
        setLocaleValue();
    }
    function getLocale() {
        return thymol.locale.value;
    }
    function getLanguage() {
        if (!thymol.locale.value) {
            if (typeof navigator !== "undefined" && !!navigator) {
                var userLang = navigator.language || navigator.userLanguage || navigator.browserLanguage || navigator.systemLanguage;
                if (!!userLang) {
                    thymol.locale.value = userLang.replace(/\-/g, "_");
                }
            }
        }
    }
    function setLocaleValue() {
        if (!thymol.locale.value) {
            thymol.locale.value = thymol.thDefaultLocale;
        }
        var sepPos;
        var locale = thymol.locale.value.replace(/\-/g, "_");
        var level = thymol.locale.value;
        var levels = [];
        var part, parts = [];
        do {
            levels.push(level);
            sepPos = locale.lastIndexOf("_");
            if (sepPos >= 0) {
                part = locale.substring(sepPos + 1);
                parts.push(part);
                locale = locale.substring(0, sepPos);
                level = level.substring(0, sepPos);
            }
        } while (sepPos >= 0);
        thymol.locale.language = level;
        if (!!parts) {
            parts.reverse();
            for (var i = 0, iLimit = parts.length; i < iLimit; i++) {
                if (i === 0) {
                    thymol.locale.country = parts[i];
                } else if (i === 1) {
                    thymol.locale.variant = parts[i];
                }
            }
        }
        thymol.locale.levels = levels;
        thymol.thExpressionObjects["#ctx"]["locale"] = thymol.locale;
        thymol.thExpressionObjects["#locale"] = thymol.locale;
    }
    function getMessage(varName, parameters, returnStringAlways) {
        if (thymol.disableMessages) {
            return undefined;
        }
        var msgKey = null;
        var locale;
        if (!!thymol.locale.levels) {
            var prefix = "$";
            var ident, section, jLower = thymol.localMessages ? 0 : 1;
            for (var j = jLower; j < 2; j++) {
                for (var i = 0, iLimit = thymol.locale.levels.length; i < iLimit + 1; i++) {
                    ident = prefix;
                    if (i < iLimit) {
                        locale = thymol.locale.levels[i];
                    } else {
                        locale = "";
                    }
                    ident = ident + locale;
                    section = thymol.messages[ident];
                    if (!section) {
                        if (j < 1) {
                            section = getLocalMessages(locale);
                        } else {
                            section = getDefaultMessages(locale);
                        }
                    }
                    if (!!section) {
                        thymol.messages[ident] = section;
                        msgKey = section[varName];
                        if (!!msgKey) {
                            break;
                        }
                    }
                }
                if (!!msgKey) {
                    break;
                }
                prefix += "$";
            }
        }
        if (!msgKey) {
            for (var i = 0, iLimit = thymol.locale.levels.length; i <= iLimit; i++) {
                if (i < iLimit) {
                    locale = thymol.locale.levels[i];
                } else {
                    locale = "";
                }
                if (!!thymol.messages[locale]) {
                    msgKey = thymol.messages[locale][varName];
                    if (!!msgKey) {
                        break;
                    }
                }
            }
        }
        if (!!msgKey) {
            if (typeof parameters === "undefined") {
                return msgKey;
            } else {
                return thymol.ThUtils.renderMessage(msgKey, parameters);
            }
        } else if (returnStringAlways !== undefined && returnStringAlways) {
            return "??" + varName + "_" + thymol.locale.value + "??";
        }
        return null;
    }
    function getProperties(propFile) {
        var props = null;
        var messages = [];
        props = getFile(propFile);
        if (!!props) {
            var splits = props.split("\n");
            if (splits.length > 0) {
                for (var i = 0, iLimit = splits.length; i < iLimit; i++) {
                    var line = splits[i].trim();
                    if (line.charAt(0) !== "#") {
                        var p = line.split("=");
                        if (p.length > 1) {
                            messages[p[0].trim()] = thymol.ThUtils.unicodeUnescape(p[1].trim());
                        }
                    }
                }
            }
        }
        return messages;
    }
    function getLocalMessages(locale) {
        var messages = [];
        if (!!thymol.thDocument.location.href) {
            var propsFile = thymol.templateName;
            if (!!locale && locale !== "") {
                propsFile += "_" + locale;
            }
            propsFile += ".properties";
            messages = getProperties(propsFile);
        }
        return messages;
    }
    function getDefaultMessages(locale) {
        var messages = null;
        var propsPath = "";
        if (thymol.useAbsolutePath) {
            propsPath += thymol.protocol + thymol.root + thymol.path;
        }
        propsPath += thymol.messagePath;
        if (propsPath !== "") {
            propsPath += "/";
        }
        var propsFile = propsPath + thymol.messagesBaseName;
        if (!!locale && locale !== "") {
            propsFile += "_" + locale;
        }
        propsFile += ".properties";
        messages = getProperties(propsFile);
        return messages;
    }
    Thymol.prototype = {
        process: function(rootNode) {
            var changed = true;
            try {
                while (changed) {
                    changed = this.processComments(rootNode);
                    changed = changed || this.processChildren(rootNode);
                }
                var elements = rootNode.getElementsByTagName("*");
                var kc = 0;
                for (var k = 0, kLimit = elements.length; k < kLimit; k++) {
                    var elem2 = elements[kc];
                    if (elem2.hasAttribute("thScript")) {
                        if (!!elem2.textContent) {
                            globalEval(elem2.textContent);
                        } else if (!!elem2.src) {
                            loadScript(elem2.src);
                        } else {
                            var dtl = elem2.getAttribute("data-thymol-load");
                            if (!!dtl) {
                                var splits = dtl.split(",");
                                for (var j = 0, jLimit = splits.length; j < jLimit; j++) {
                                    loadScript(splits[j]);
                                }
                            }
                        }
                        elem2.parentNode.removeChild(elem2);
                        elements = rootNode.getElementsByTagName("*");
                    } else {
                        kc++;
                    }
                }
                kc = 0;
                for (var k = 0, kLimit = elements.length; k < kLimit; k++) {
                    var elem2 = elements[kc];
                    var elName = elem2.nodeName.toLowerCase();
                    if (elName == thymol.thBlock.name || elName == thymol.thBlock.synonym) {
                        thymol.ThUtils.removeTag(elem2);
                        elements = rootNode.getElementsByTagName("*");
                    } else {
                        kc++;
                    }
                }
                var removeArray = rootNode.querySelectorAll(thymol.thRemove.escpName + "," + thymol.thRemove.escpSynonym);
                for (var i = 0, iLimit = removeArray.length; i < iLimit; i++) {
                    var rmElement = removeArray[i];
                    for (var j = 0, jLimit = rmElement.attributes.length; j < jLimit; j++) {
                        var attr = rmElement.attributes.item(j);
                        if (thymol.thRemove.name == attr.localName || thymol.thRemove.synonym == attr.localName) {
                            thymol.processRemove(rmElement, attr);
                            break;
                        }
                    }
                }
            } catch (err) {
                thymol.alert(err);
            }
        },
        processChildren: function(rootNode) {
            var i, iLimit, j, jLimit, k, kLimit, changed = false;
            var elements = rootNode.getElementsByTagName("*");
            for (k = 0, kLimit = elements.length; k < kLimit; k++) {
                var elem1 = elements[k];
                for (j = 0, jLimit = thymol.thThymeleafElementsList.length; j < jLimit; j++) {
                    if (elem1.localName == thymol.thThymeleafElementsList[j].name || elem1.localName == thymol.thThymeleafElementsList[j].synonym) {
                        var updated = thymol.thThymeleafElementsList[j].process(elem1);
                        if (updated) {
                            elements = rootNode.getElementsByTagName("*");
                            k--;
                            kLimit = elements.length;
                            changed = true;
                        }
                        break;
                    }
                }
                var allAttributes = elem1.attributes;
                if (allAttributes && allAttributes.length > 0) {
                    var attributes = [], aii = 0;
                    if (!thymol.thUsingNullPrefix) {
                        for (i = 0, iLimit = allAttributes.length; i < iLimit; i++) {
                            var ai = allAttributes.item(i);
                            if (ai) {
                                for (j = 0, jLimit = thymol.thThymeleafPrefixList.length; j < jLimit; j++) {
                                    var attrName = ai.name.toString();
                                    if (attrName.length > thymol.thThymeleafPrefixList[j].length) {
                                        attrName = attrName.substring(0, thymol.thThymeleafPrefixList[j].length);
                                        if (attrName === thymol.thThymeleafPrefixList[j]) {
                                            ai.order = i;
                                            attributes[aii++] = ai;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        for (i = 0, iLimit = allAttributes.length; i < iLimit; i++) {
                            attributes[i] = allAttributes.item(i);
                        }
                    }
                    if (attributes.length > 0) {
                        attributes.sort(function(a, b) {
                            return b.order - a.order;
                        });
                        var matchedAttributes = [];
                        for (i = 0, iLimit = attributes.length; i < iLimit; i++) {
                            var splits = attributes[i].name.toString().split(":");
                            if (splits && splits.length > 0) {
                                var prefix = "", name;
                                if (splits.length > 1) {
                                    prefix = splits[0];
                                    name = splits[1];
                                } else {
                                    name = splits[0];
                                    var hpos = name.lastIndexOf("-");
                                    if (hpos >= 0) {
                                        prefix = name.substring(0, hpos + 1);
                                    }
                                }
                                var attrList = thymol.thThymeleafPrefixList[prefix];
                                if (splits.length > 1) {
                                    prefix += ":";
                                }
                                if (attrList) {
                                    for (j = 0, jLimit = attrList.length; j < jLimit; j++) {
                                        var matched = false;
                                        if (name === attrList[j].suffix || name === attrList[j].synonym) {
                                            matched = true;
                                        } else if (attrList[j].regex !== null) {
                                            var fqn = prefix + name;
                                            matched = attrList[j].regex.test(fqn);
                                        }
                                        if (matched) {
                                            var matchedAttribute = {};
                                            matchedAttribute.attr = attrList[j];
                                            matchedAttribute.elementAttr = attributes[i];
                                            matchedAttributes.push(matchedAttribute);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (matchedAttributes.length > 0) {
                            matchedAttributes.sort(function(a, b) {
                                return a.attr.precedence - b.attr.precedence;
                            });
                            var updated = false;
                            for (i = 0, iLimit = matchedAttributes.length; i < iLimit; i++) {
                                updated = thymol.ThUtils.processElement(matchedAttributes[i].attr.process, elem1, matchedAttributes[i].elementAttr, matchedAttributes[i].attr, 1);
                                if (updated) {
                                    break;
                                }
                            }
                            if (updated) {
                                elements = rootNode.getElementsByTagName("*");
                                k--;
                                kLimit = elements.length;
                                changed = true;
                            }
                        }
                    }
                }
            }
        },
        override: function(paramName, paramValue) {
            var param = paramValue, thv;
            if (!!thymol.requestContext) {
                thv = thymol.requestContext[paramName];
            }
            if (typeof thv === "undefined" && !!thymol.applicationContext) {
                thv = thymol.applicationContext[paramName];
                if (typeof thv === "undefined") {
                    thv = thymol.applicationContext.javascriptify(paramName);
                }
            }
            if (typeof thv === "undefined" && !!thymol.thWindow) {
                thv = thymol.thWindow[paramName];
            }
            if (typeof thv !== "undefined") {
                if (thv instanceof thymol.ThParam) {
                    param = thv.value;
                } else {
                    param = thv;
                }
            }
            return param;
        },
        doDisable: function(attrName) {
            var tha = this.getThAttrByName(attrName);
            if (tha !== null) {
                tha.disable();
            } else {
                thymol.error(false, 'cannot disable unknown attribute "' + attrName + '"');
            }
        },
        getThAttrByName: function(name) {
            var attrList = thymol.thThymeleafPrefixList[thymol.prefix];
            var i, iLimit = attrList.length;
            for (i = 0; i < iLimit; i++) {
                if (name === attrList[i].suffix) {
                    return attrList[i];
                }
            }
            return null;
        },
        getContents: function(rootNode) {
            var rnd = rootNode.thDoc;
            var fstar = rnd.querySelectorAll("*");
            return fstar;
        },
        processComments: function(rootNode) {
            var comments = null, fstar, changed = false, changing = false, i, iLimit, startComment, parent, startValue, pointer, nextPointer;
            do {
                comments = [];
                var iterator = thymol.thDocument.createNodeIterator(rootNode, SHOW_COMMENT, function() {
                    return FILTER_ACCEPT;
                }, false);
                var curNode;
                while (curNode = iterator.nextNode()) {
                    comments.push(curNode);
                }
                changing = false;
                for (i = 0, iLimit = comments.length; i < iLimit; i++) {
                    startComment = comments[i];
                    parent = startComment.parentNode;
                    startValue = startComment.nodeValue.trim();
                    if (startParserLevelCommentExpr.test(startValue)) {
                        pointer = startComment;
                        while (pointer != null) {
                            if (endParserLevelCommentExpr.test(pointer.nodeValue)) {
                                changing = parent.removeChild(pointer) != null;
                                break;
                            }
                            nextPointer = pointer.nextSibling;
                            changing = parent.removeChild(pointer) != null;
                            pointer = nextPointer;
                        }
                    } else if (startParserLevelCommentExpr2.test(startValue) && endParserLevelCommentExpr2.test(startValue)) {
                        parent.removeChild(startComment);
                        changing = true;
                    }
                }
                changed = changed || changing;
            } while (changing);
            return changed || this.processPrototypeOnlyComments(rootNode);
        },
        processPrototypeOnlyComments: function(rootNode) {
            var comments = null, fstar, changed = false, changing = false, indexOfLast, i, iLimit, j, jLimit, k, kLimit, startComment, parent, startValue, deletions, res, fullText, innerNodes, done, next, commentText, res2, blockElement, blockDoc, blockDocBody, blockBase, newNode, newDoc;
            do {
                comments = [];
                var iterator = thymol.thDocument.createNodeIterator(rootNode, SHOW_COMMENT, function() {
                    return FILTER_ACCEPT;
                }, false);
                var curNode;
                while (curNode = iterator.nextNode()) {
                    comments.push(curNode);
                }
                changing = false;
                indexOfLast = comments.length - 1;
                for (i = 0, iLimit = comments.length; i < iLimit; i++) {
                    startComment = comments[i];
                    parent = startComment.parentNode;
                    if (parent != null) {
                        startValue = startComment.nodeValue.trim();
                        deletions = [];
                        deletions.push(startComment);
                        startValue = startValue.replace(/\n/g, "");
                        res = startValue.match(prototypeOnlyCommentEscpExpr);
                        if (res) {
                            fullText = startValue;
                            if (parent.localName == "table" || parent.localName == "tbody") {
                                if (startValue.indexOf(thymol.thBlock.name) >= 0 || startValue.indexOf(thymol.thBlock.synonym) >= 0) {
                                    if (startValue.indexOf(thymol.thBlock.endName) < 0 || startValue.indexOf(thymol.thBlock.endSynonym) < 0) {
                                        fullText = fullText.replace(res[0], res[1]);
                                        innerNodes = [];
                                        done = false;
                                        next = startComment;
                                        do {
                                            next = next.nextSibling;
                                            if (next != null) {
                                                deletions.push(next);
                                                if (i < indexOfLast) {
                                                    if (next == comments[i + 1]) {
                                                        commentText = next.nodeValue;
                                                        if (commentText.indexOf(thymol.thBlock.endName) >= 0 || commentText.indexOf(thymol.thBlock.endSynonym) >= 0) {
                                                            res2 = commentText.match(prototypeOnlyCommentEscpExpr);
                                                            if (res2) {
                                                                commentText = commentText.replace(res2[0], res2[1]);
                                                                fullText = fullText + commentText;
                                                            }
                                                            done = true;
                                                        }
                                                    } else {
                                                        innerNodes.push(next);
                                                    }
                                                }
                                            } else {
                                                done = true;
                                            }
                                        } while (!done);
                                        blockElement = null;
                                        blockDoc = thymol.thDomParse(fullText, "text/html");
                                        blockDocBody = blockDoc.getElementsByTagName("body")[0];
                                        for (j = 0, jLimit = blockDocBody.childNodes.length; j < jLimit; j++) {
                                            if (blockDocBody.childNodes[j].localName == thymol.thBlock.name || blockDocBody.childNodes[j].localName == thymol.thBlock.synonym) {
                                                blockElement = blockDocBody.childNodes[j];
                                                for (k = 0, kLimit = innerNodes.length; k < kLimit; k++) {
                                                    newNode = blockDoc.importNode(innerNodes[k], true);
                                                    blockElement.appendChild(newNode);
                                                }
                                            }
                                        }
                                        if (blockElement != null) {
                                            this.processChildren(blockDoc);
                                            changing = this.insertUncommented(blockDoc, deletions, parent);
                                        } else {
                                            parent.removeChild(startComment);
                                            changing = true;
                                        }
                                    } else {
                                        parent.removeChild(startComment);
                                        changing = true;
                                    }
                                }
                            } else {
                                newDoc = thymol.thDomParse(res[1], "text/html");
                                changing = this.insertUncommented(newDoc, deletions, parent);
                            }
                        }
                    }
                }
                changed = changed || changing;
            } while (changing);
            return changed;
        },
        insertUncommented: function(doc, deletions, parent) {
            var docBody = doc.getElementsByTagName("body")[0], i, iLimit, newNode;
            for (i = 0, iLimit = docBody.childNodes.length; i < iLimit; i++) {
                if (parent.ownerDocument === doc) {
                    newNode = docBody.childNodes[i].cloneNode(true);
                } else {
                    newNode = parent.ownerDocument.importNode(docBody.childNodes[i], true);
                }
                parent.insertBefore(newNode, deletions[0]);
            }
            for (i = 0, iLimit = deletions.length; i < iLimit; i++) {
                parent.removeChild(deletions[i]);
            }
            return true;
        },
        getList: function(element, content) {
            var argValue = content.trim(), argsCount = 0, argsList = [], assigs, i, iLimit, val;
            if (argValue) {
                assigs = argValue.split(",");
                for (i = 0, iLimit = assigs.length; i < iLimit; i++) {
                    val = thymol.getExpression(assigs[i], element);
                    argsList[i] = val;
                }
                if (!element.thLocalVars) {
                    element.thLocalVars = {};
                }
                element.thLocalVars["..."] = argsList;
                argsCount = argsList.length;
            }
            return argsCount;
        },
        testParam: function(param) {
            var initial = param, result = false, theParam = null, negate = false;
            if (typeof initial === "boolean") {
                result = initial;
            } else {
                theParam = null;
                negate = false;
                if (typeof initial === "object" && initial instanceof thymol.ThParam) {
                    theParam = initial;
                } else {
                    initial = initial.valueOf();
                    if (initial.charAt(0) == "!") {
                        negate = true;
                        initial = initial.substring(1);
                    }
                }
                theParam = thymol.applicationContext[initial];
                if (theParam != null) {
                    result = theParam.getBooleanValue();
                }
                if (negate) {
                    result = !result;
                }
            }
            return result ? true : false;
        },
        processImport: function(element, attr, thAttr) {
            var changed = false, importNode = null, filePart, fragmentPart, names, parts, fragmentArgsList, fragment, fileName, content, importError;
            filePart = null;
            if (attr.value.indexOf("::") < 0) {
                filePart = attr.value;
                fragmentPart = "::";
            } else {
                names = attr.value.split("::");
                filePart = names[0].trim();
                fragmentPart = names[1].trim();
            }
            if ("this" === filePart) {
                filePart = "";
            } else {
                filePart = Thymol.prototype.getFilePath(filePart, element);
            }
            if (filePart != null) {
                parts = filePart.match(thymol.varParExpr);
                fragmentArgsList = null;
                if (parts) {
                    if (parts.length > 1) {
                        filePart = parts[1].trim();
                    }
                    if (parts.length > 2) {
                        fragmentArgsList = parts[2].trim();
                    }
                }
                var fragmentName = fragmentPart;
                if (filePart != "" || !isFragmentChild(element)) {
                    parts = fragmentName.match(thymol.varParExpr);
                    if (parts == null && fragmentArgsList != null) {
                        parts = [];
                        parts[1] = fragmentName;
                        parts[2] = fragmentArgsList;
                    }
                    argsCount = 0;
                    if (parts) {
                        if (parts.length > 1) {
                            fragmentName = parts[1].trim();
                            if (parts.length > 2) {
                                if (parts[2].indexOf("=") > 0) {
                                    argsCount = thymol.getWith(element, parts[2]);
                                } else {
                                    argsCount = Thymol.prototype.getList(element, parts[2]);
                                }
                            }
                        }
                    }
                    var tfn = thymol.substitute(fragmentName, element);
                    if (!!tfn) {
                        fragmentName = tfn;
                    }
                    tfn = thymol.substitute(filePart, element);
                    if (!!tfn) {
                        filePart = tfn;
                    }
                    content = Thymol.prototype.getFromCache(element, filePart, fragmentName);
                    if (!!content) {
                        importNode = Thymol.prototype.getImportNode(element, filePart, fragmentName, fragmentPart, argsCount, content, true);
                    } else {
                        fragment = null;
                        importError = null;
                        if (filePart != "") {
                            fileName = filePart + thymol.templateSuffix;
                            var textContent = getFile(fileName);
                            content = thymol.thDomParse(textContent, "text/html");
                            fragment = Thymol.prototype.getImportNode(element, filePart, fragmentName, fragmentPart, argsCount, content, false);
                        } else {
                            fragment = Thymol.prototype.getImportNode(element, filePart, fragmentName, fragmentPart, argsCount, thymol.thDocument, false);
                        }
                        if (fragment == null) {
                            thymol.error(false, "processImport fragment import failed: " + filePart + " fragment: " + fragmentPart, element);
                        } else {
                            importNode = fragment;
                        }
                    }
                    var isNode = thymol.thReplace.name == attr.localName || thymol.thReplace.synonym == attr.localName || thymol.thSubstituteby.name == attr.localName || thymol.thSubstituteby.synonym == attr.localName;
                    Thymol.prototype.doReplace(isNode, element, importNode);
                    changed = true;
                }
            }
            element.removeAttribute(attr.name);
            return changed;
        },
        getFromCache: function(element, filePart, fragmentName) {
            var content = null;
            if (thymol.thFragmentCache[filePart] != null) {
                var signature = Thymol.prototype.getFragmentSignature(fragmentName, element.thLocalVars);
                content = thymol.thFragmentCache[filePart][signature];
            }
            return content;
        },
        getImportNode: function(element, filePart, fragmentName, fragmentPart, argsCount, content, isCached) {
            var result = null, parts, matched, fragment, htmlContent, fragArray, i, iLimit, j, jLimit, k, clean, bare, vlParts, vlArgs, argsList, varName, newElement;
            matched = false;
            fragment = null;
            if (isCached) {
                result = content;
                matched = true;
            } else if (fragmentName == "::") {
                htmlContent = content.getElementsByTagName("html")[0];
                result = htmlContent;
                matched = true;
            } else {
                fragArray = content.querySelectorAll(thymol.thFragment.escpName + "," + thymol.thFragment.escpSynonym);
                for (i = 0, iLimit = fragArray.length; i < iLimit; i++) {
                    fragment = fragArray[i];
                    for (j = 0, jLimit = fragment.attributes.length; j < jLimit; j++) {
                        matched = Thymol.prototype.matchAndSetArgsList(element, fragment.attributes.item(j), argsCount, fragmentName, fragmentPart);
                        if (matched) {
                            break;
                        }
                    }
                    if (matched) {
                        result = fragment;
                        break;
                    }
                }
            }
            if (!matched) {
                fragment = Thymol.prototype.getDOMSelection(fragmentName, content);
                if (fragment) {
                    matched = true;
                    result = fragment;
                } else {
                    if (!element.isBlockChild) {
                        thymol.error(true, 'getImportNode cannot match fragment: "' + fragmentName + '"', element);
                    }
                }
            }
            if (matched) {
                var signature = Thymol.prototype.getFragmentSignature(fragmentName, element.thLocalVars);
                if (thymol.thFragmentCache[filePart] == null) {
                    thymol.thFragmentCache[filePart] = new Object();
                }
                thymol.thFragmentCache[filePart][signature] = result;
                newElement = result.cloneNode(true);
                if (newElement.nodeType === ELEMENT_NODE) {
                    newElement.removeAttribute(thymol.thFragment.name);
                    newElement.removeAttribute(thymol.thFragment.synonym);
                    if (fragment !== null) {
                        fragment.removeAttribute(thymol.thFragment.name);
                        fragment.removeAttribute(thymol.thFragment.synonym);
                    }
                    var fragState = null;
                    if (filePart == "" && !!element.state) {
                        fragState = element.state;
                    } else {
                        fragState = new ThState(filePart, content);
                    }
                    var elements = newElement.getElementsByTagName("*");
                    for (var k = 0, kLimit = elements.length; k < kLimit; k++) {
                        elements[k].state = fragState;
                    }
                }
                result = newElement;
                result.thLocalVars = element.thLocalVars;
            }
            return result;
        },
        getFragmentSignature: function(fragmentName, localVars) {
            var signature = fragmentName;
            return signature;
        },
        matchAndSetArgsList: function(element, attribute, argsCount, fragmentName, fragmentPart) {
            var matched = false, k, kLimit;
            var clean = attribute.value.replace(/\s/g, "");
            var bare = null;
            var vlParts = clean.match(thymol.varParExpr);
            if (vlParts) {
                if (vlParts.length > 1) {
                    bare = vlParts[1].trim();
                    if (fragmentName == bare && argsCount > 0) {
                        var vlArgs = vlParts[2].trim().split(",");
                        if (vlArgs) {
                            var argsList = element.thLocalVars["..."];
                            if (!!argsList) {
                                if (vlArgs.length == argsCount) {
                                    matched = true;
                                    for (k = 0; k < argsCount; k++) {
                                        var varName = vlArgs[k].trim();
                                        element.thLocalVars[varName] = argsList[k];
                                    }
                                }
                            } else {
                                var vlOk = true;
                                for (k = 0, kLimit = vlArgs.length; k < kLimit; k++) {
                                    var lv = element.thLocalVars[vlArgs[k]];
                                    if (typeof lv === "undefined") {
                                        vlOk = false;
                                        break;
                                    }
                                }
                                matched = vlOk;
                            }
                        }
                    }
                }
            }
            if (fragmentName == clean || fragmentPart == clean) {
                matched = true;
            }
            return matched;
        },
        getDOMSelection: function(initial, content) {
            var junk = false, spec = initial, result = null, scope = "", query = new Array(), parts = "", innr = thymol.ThUtils.unBracket(spec), i, iLimit, j, jLimit, k, kLimit, m, mLimit, token, indx, saved, indxed, start, selection, descend, subQuery, exprFrags, classSpecs, qTerms, subSelect, partial, html, newNode;
            if (spec != innr && innr.charAt(innr.length - 1) == "]") {
                spec = innr;
            }
            while (spec != "" && !junk) {
                junk = true;
                parts = spec.match(domSelectExpr);
                if (parts != null && parts.length > 1) {
                    for (i = 1, iLimit = parts.length; i < iLimit; i++) {
                        if (!!parts[i]) {
                            junk = false;
                            token = parts[i];
                            indx = null;
                            innr = thymol.ThUtils.unBracket(token);
                            if (token != innr) {
                                if (innr.match(numericExpr)) {
                                    indx = innr;
                                }
                            }
                            saved = spec;
                            spec = spec.replace(token, "");
                            if (saved == spec) {
                                spec = "";
                            }
                            if (indx) {
                                token = query[query.length - 1];
                                indxed = new String(token);
                                indxed.indx = indx;
                                query[query.length - 1] = indxed;
                            } else {
                                query.push(token.trim());
                            }
                            break;
                        }
                    }
                } else {
                    break;
                }
            }
            start = 0;
            if (query.length > 0 && query[0] != "" && query[0].charAt(0) == "/") {
                scope = query[0];
                start = 1;
            }
            selection = [];
            selection.push(content);
            descend = false;
            for (i = start, iLimit = query.length; i < iLimit; i++) {
                subQuery = query[i];
                innr = thymol.ThUtils.unBracket(subQuery);
                if (subQuery != innr) {
                    innr = innr.replace(/[']/g, '"');
                    subQuery = "";
                    exprFrags = innr.split(/\s{1}\s*((?:and)|(?:or))\s{1}\s*/);
                    for (j = 0, jLimit = exprFrags.length; j < jLimit; j++) {
                        if (exprFrags[j] != "and" && exprFrags[j] != "or") {
                            classSpecs = exprFrags[j].match(/[@]?\s*(?:class)\s*(\W?[=])\s*[\"]((?:\w*[\-_]*)*)[\"]/);
                            if (classSpecs && classSpecs.length > 0) {
                                if (classSpecs[1] == "=") {
                                    subQuery = subQuery + "[class~='" + classSpecs[2] + "']";
                                }
                                if (classSpecs[1] == "^=") {
                                    subQuery = subQuery + "[class^='" + classSpecs[2] + "'],[class*=' " + classSpecs[2] + "']";
                                }
                            } else {
                                subQuery = subQuery + Thymol.prototype.cssSelectorize("[" + exprFrags[j] + "]");
                            }
                        } else if (exprFrags[j] == "or") {
                            subQuery = subQuery + ",";
                        }
                    }
                }
                qTerms = subQuery.split("/");
                for (j = 0, jLimit = qTerms.length; j < jLimit; j++) {
                    var qTerm = qTerms[j];
                    if (qTerm != "") {
                        qTerm = qTerm.replace(/[@]/g, "");
                        subSelect = [];
                        for (k = 0, kLimit = selection.length; k < kLimit; k++) {
                            partial = [];
                            if (qTerm == "text") {
                                var iterator = thymol.thDocument.createNodeIterator(selection[k], SHOW_TEXT, function() {
                                    return FILTER_ACCEPT;
                                }, true);
                                var curNode;
                                while (curNode = iterator.nextNode()) {
                                    partial.push(curNode);
                                }
                            } else if (descend) {
                                Thymol.prototype.pushMatching(partial, selection[k].children, qTerm, subQuery.indx);
                            } else if (j == 0) {
                                if (scope == "/") {
                                    var rtn = selection[k];
                                    html = selection[k].getElementsByTagName("HTML");
                                    if (html.length > 0) {
                                        rtn = html[0];
                                    }
                                    var bdys = rtn.getElementsByTagName("BODY");
                                    for (l = 0, lLimit = bdys.length; l < lLimit; l++) {
                                        Thymol.prototype.pushMatching(partial, bdys[l].children, qTerm, subQuery.indx);
                                    }
                                    scope = "";
                                } else {
                                    if (i == 0 || scope == "//") {
                                        Thymol.prototype.pushMatchingNodes(partial, selection[k], qTerm, subQuery.indx);
                                        scope = "";
                                    } else {
                                        Thymol.prototype.pushMatching(partial, [ selection[k] ], qTerm, subQuery.indx);
                                    }
                                }
                            } else {
                                Thymol.prototype.pushMatching(partial, selection[k].children, qTerm, subQuery.indx);
                            }
                            if (partial != null) {
                                for (m = 0, mLimit = partial.length; m < mLimit; m++) {
                                    subSelect.push(partial[m]);
                                }
                            }
                        }
                        selection = subSelect;
                    }
                }
                descend = qTerms[qTerms.length - 1] == "";
            }
            result = selection;
            if (result != null && !(result.length === undefined)) {
                if (result.length > 1) {
                    newNode = thymol.thDocument.createDocumentFragment();
                    for (i = 0, iLimit = result.length; i < iLimit; i++) {
                        var newChild = thymol.thDocument.importNode(result[i], true);
                        newNode.appendChild(newChild);
                    }
                    result = newNode;
                } else {
                    result = result[0];
                }
            }
            return result;
        },
        cssSelectorize: function(expr) {
            var result = expr;
            var cmp = expr.indexOf("!=");
            if (cmp > -1) {
                result = ":not(" + expr.substring(0, cmp) + "=" + expr.substring(cmp + 2) + ")";
            }
            return result;
        },
        pushMatching: function(result, root, selector, indx) {
            var kLimit = root.length;
            if (!indx) {
                for (var i = 0; i < kLimit; i++) {
                    try {
                        if (root[i].matches(selector)) {
                            result.push(root[i]);
                        }
                    } catch (err) {}
                }
            } else {
                var si = Number.parseInt(indx);
                var ki = 0;
                for (var i = 0; i < kLimit; i++) {
                    try {
                        if (root[i].matches(selector)) {
                            if (ki === si) {
                                result.push(root[i]);
                                break;
                            }
                            ki++;
                        }
                    } catch (err) {}
                }
            }
        },
        pushMatchingNodes: function(result, rootNode, selector, indx) {
            var iterator = thymol.thDocument.createNodeIterator(rootNode, SHOW_ALL, function(node) {
                if (node.nodeType === ELEMENT_NODE) {
                    try {
                        return node.matches(selector) ? FILTER_ACCEPT : FILTER_REJECT;
                    } catch (err) {
                        return FILTER_REJECT;
                    }
                } else {
                    return node.nodeName.toLowerCase() === selector.toLowerCase() ? FILTER_ACCEPT : FILTER_REJECT;
                }
            }, false);
            var curNode;
            if (!indx) {
                while (curNode = iterator.nextNode()) {
                    result.push(curNode);
                }
            } else {
                var cnt = 0;
                indx = Number.parseInt(indx);
                while (curNode = iterator.nextNode()) {
                    if (cnt === indx) {
                        result.push(curNode);
                        break;
                    }
                    cnt++;
                }
            }
        },
        getFilePath: function(part, element) {
            var result = thymol.substitute(part, element), mapped = null, slashpos;
            if (result) {
                if (thymol.mappings) {
                    mapped = thymol.getMapped(result, false);
                }
            }
            if (mapped) {
                result = mapped;
            } else {
                var dotFirst = result.charAt(0) === ".";
                if (result && (thymol.useAbsolutePath || !dotFirst)) {
                    slashpos = result.indexOf("/");
                    if (thymol.useAbsolutePath || slashpos >= 0) {
                        if (slashpos == 0 && !thymol.useAbsolutePath) {
                            result = result.substring(1);
                        }
                        var proto = "";
                        if (thymol.useAbsolutePath) {
                            proto = thymol.protocol;
                        }
                        if (thymol.useAbsolutePath && !!thymol.absolutePath) {
                            result = proto + thymol.absolutePath + result;
                        } else {
                            if (dotFirst) {
                                result = thymol.templatePath + result;
                            } else {
                                result = proto + thymol.root + thymol.path + result;
                            }
                        }
                    }
                }
            }
            return result;
        },
        doLiteralSubstExpr: function(param, primary) {
            var result = param.trim(), term, subst, lsp;
            if (thymol.ThUtils.isLiteralSubst(result)) {
                result = this.decodeLiteralSubst(result);
            } else {
                term = primary;
                while (term != null) {
                    if (thymol.ThUtils.isLiteralSubst(term)) {
                        subst = this.decodeLiteralSubst(term);
                        result = result.replace(term, subst);
                        lsp = result.match(litSubstExpr);
                        if (lsp && lsp.length > 0) {
                            term = lsp[1];
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
            return result;
        },
        decodeLiteralSubst: function(param) {
            var result = param, parts, rep, i, iLimit;
            result = result.trim();
            result = result.substring(1, result.length - 1);
            result = result.replace(/[\']/g, "&#39;");
            parts = result.split(varRefExpr);
            if (parts && parts.length > 0) {
                rep = "";
                for (i = 0, iLimit = parts.length; i < iLimit; i++) {
                    if (parts[i] != "") {
                        if (!parts[i].match(varRefExpr)) {
                            parts[i] = "'" + parts[i] + "'";
                        }
                        if (rep == "") {
                            rep = parts[i];
                        } else {
                            rep = rep + "+" + parts[i];
                        }
                    }
                }
                result = rep;
            }
            return result;
        },
        doReplace: function(isNode, element, content) {
            if (isNode) {
                var parent = element.parentNode;
                if (content.nodeName.toLowerCase() == "html") {
                    this.doInsertion(element, content, function(e, n) {
                        if (n.nodeType === ELEMENT_NODE) {
                            n.removeAttribute(thymol.thFragment.name);
                            n.removeAttribute(thymol.thFragment.synonym);
                        }
                        e.parentNode.insertBefore(n, e);
                    });
                    parent.removeChild(element);
                } else {
                    var node = this.doClone(content, parent.ownerDocument);
                    parent.replaceChild(node, element);
                    if (node.nodeType === ELEMENT_NODE) {
                        node.removeAttribute(thymol.thFragment.name);
                        node.removeAttribute(thymol.thFragment.synonym);
                    }
                }
            } else {
                try {
                    while (element.firstChild != null) {
                        element.removeChild(element.firstChild);
                        if (element.firstChild == null) {
                            break;
                        }
                    }
                    if (element.nodeType === DOCUMENT_NODE) {
                        if (content.nodeType !== DOCUMENT_NODE) {
                            element.appendChild(content);
                        } else {
                            if (content.childNodes !== null) {
                                var cNodes = content.childNodes.length;
                                if (cNodes > 0) {
                                    for (i = 0; i < cNodes; i++) {
                                        var iNode = content.childNodes[i];
                                        if (!!iNode && iNode.nodeType !== DOCUMENT_NODE && iNode.nodeType !== DOCUMENT_TYPE_NODE && iNode.nodeType !== DOCUMENT_FRAGMENT_NODE) {
                                            element.appendChild(iNode);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        this.doInsertion(element, content, function(e, n) {
                            if (n.nodeType === ELEMENT_NODE) {
                                n.removeAttribute(thymol.thFragment.name);
                                n.removeAttribute(thymol.thFragment.synonym);
                            }
                            e.appendChild(n);
                        });
                    }
                } catch (err) {
                    element.innerHTML = content.innerHTML;
                }
            }
        },
        doClone: function(old, targetDoc) {
            var node, cNodes, i, iNode, aNode;
            if (!!old.parentNode && old.parentNode.ownerDocument === targetDoc) {
                node = old.cloneNode(false);
            } else {
                node = targetDoc.importNode(old, false);
            }
            if (node !== null) {
                if (node.nodeType === ELEMENT_NODE) {
                    if (old.thLocalVars !== null) {
                        node.thLocalVars = old.thLocalVars;
                        node.state = old.state;
                    }
                    if (node.nodeName.toLowerCase() == "script") {
                        node.setAttribute("thScript", "true");
                    }
                }
                if (old.childNodes !== null) {
                    cNodes = old.childNodes.length;
                    if (cNodes > 0) {
                        for (i = 0; i < cNodes; i++) {
                            iNode = old.childNodes[i];
                            if (iNode !== null) {
                                aNode = this.doClone(iNode, targetDoc);
                                if (aNode !== null) {
                                    if (aNode.nodeName.toLowerCase() == "script") {
                                        aNode.setAttribute("thScript", "true");
                                    }
                                    node.appendChild(aNode);
                                }
                            }
                        }
                    }
                }
            }
            return node;
        },
        doInsertion: function(element, content, func) {
            var topLevel = true, parent = element.parentElement, i, iLimit, iNode, elementName, j, jLimit, jNode, cJNode, cINode;
            if (parent != null) {
                topLevel = element.parentElement.nodeName.toLowerCase() == "html";
            }
            for (i = 0, iLimit = content.childNodes.length; i < iLimit; i++) {
                iNode = content.childNodes[i];
                if (iNode) {
                    if (!topLevel) {
                        elementName = iNode.nodeName.toLowerCase();
                        if (elementName != "head") {
                            if (elementName == "body") {
                                for (j = 0, jLimit = iNode.childNodes.length; j < jLimit; j++) {
                                    jNode = iNode.childNodes[j];
                                    if (jNode) {
                                        cJNode = this.doClone(jNode, parent.ownerDocument);
                                        func(element, cJNode);
                                    }
                                }
                            } else {
                                cINode = this.doClone(iNode, parent.ownerDocument);
                                func(element, cINode);
                            }
                        }
                    } else {
                        cINode = this.doClone(iNode, parent.ownerDocument);
                        func(element, cINode);
                    }
                }
            }
        },
        getThParam: function(paramName, isBoolean, isPath, defaultValue) {
            var localValue = defaultValue, globalValue, theParam = thymol.ThUtils.getParameter(paramName);
            if (!!thymol.thWindow) {
                globalValue = thymol.thWindow[paramName];
            }
            if (typeof globalValue === "undefined") {
                globalValue = thymol.applicationContext.javascriptify(paramName);
            }
            if (!!theParam) {
                if (theParam instanceof ThParam) {
                    if (theParam.globalValue !== globalValue) {
                        theParam.globalValue = globalValue;
                        theParam.value = globalValue;
                        localValue = globalValue;
                    }
                }
                if (isBoolean) {
                    localValue = theParam.getBooleanValue();
                }
            } else {
                if (!(typeof globalValue === "undefined")) {
                    if (globalValue != null) {
                        if (isBoolean) {
                            localValue = globalValue == true;
                        } else {
                            localValue = globalValue;
                        }
                    }
                }
            }
            if (!isBoolean && isPath && localValue.length > 0 && localValue.charAt(localValue.length - 1) != "/") {
                localValue = localValue + "/";
            }
            thymol.applicationContext.createVariable(paramName, localValue);
            return localValue;
        }
    };
    function addDialect(spec) {
        var i, iLimit, prec = thymol.thDefaultPrecedence;
        if (spec !== null && typeof spec !== "undefined") {
            if (spec.attributeProcessors !== null && typeof spec.attributeProcessors !== "undefined") {
                for (i = 0, iLimit = spec.attributeProcessors.length; i < iLimit; i++) {
                    if (spec.attributeProcessors[i].precedence !== null && typeof spec.attributeProcessors[i].precedence !== "undefined") {
                        prec = spec.attributeProcessors[i].precedence;
                    } else {
                        prec = thymol.thDefaultPrecedence;
                    }
                    configureAttributeProcessor(spec.prefix, spec.attributeProcessors[i].name, spec.attributeProcessors[i].processor, prec, spec.attributeProcessors[i].override, null);
                }
            }
            if (spec.elementProcessors !== null && typeof spec.elementProcessors !== "undefined") {
                for (i = 0, iLimit = spec.elementProcessors.length; i < iLimit; i++) {
                    configureElementProcessor(spec.prefix, spec.elementProcessors[i].name, spec.elementProcessors[i].processor);
                }
            }
            if (spec.objects !== null && typeof spec.objects !== "undefined") {
                for (i = 0, iLimit = spec.objects.length; i < iLimit; i++) {
                    if (spec.objects[i].name !== null && typeof spec.objects[i].name !== "undefined") {
                        spec.objects[i].object.thExpressionObjectName = spec.objects[i].name;
                        configureModule(spec.objects[i].object);
                    } else {
                        configureModule(spec.objects[i]);
                    }
                }
            }
        }
    }
    function getFile(file, report) {
        var content = thymol.thFragmentCache[file];
        if (content == null) {
            content = thymol.readFile(file, report);
            thymol.thFragmentCache[file] = content;
        }
        return content;
    }
    var globalEval = function() {
        var isIndirectEvalGlobal = function(original, Object) {
            try {
                return (1, eval)("Object") === original;
            } catch (err) {
                return false;
            }
        }(Object, 123);
        if (isIndirectEvalGlobal) {
            return function(expression) {
                return (1, eval)(expression);
            };
        } else if (typeof thymol.thWindow.execScript !== "undefined") {
            return function(expression) {
                return thymol.thWindow.execScript(expression);
            };
        }
    }();
    function loadScript(file) {
        var script = Thymol.prototype.getFilePath(file);
        var content = getFile(script);
        globalEval(content);
    }
    function diffTail(region, path) {
        var result = path;
        if (!!region) {
            var regParts = region.split("/");
            if (!!path) {
                var pathParts = path.split("/");
                for (var k = 0, kLimit = pathParts.length; k < kLimit; k++) {
                    if (pathParts[k] !== regParts[k]) {
                        break;
                    }
                }
                if (k < kLimit) {
                    result = pathParts.slice(k).join("/");
                }
            }
        }
        return result;
    }
    function pointInCode(element) {
        var elements = element.state.dom.getElementsByTagName("*");
        var count = 0;
        for (var k = 0, kLimit = elements.length; k < kLimit; k++) {
            if (element.tagName === elements[k].tagName) {
                count++;
                if (element.isSameNode(elements[k])) {
                    break;
                }
            }
        }
        var lineInFile = undefined;
        var columnInFile = undefined;
        var tabsBeforeColumnInFile = undefined;
        if (count >= 0) {
            var html = element.state.content.toLowerCase();
            var result;
            var tag = "<" + element.tagName.toLowerCase();
            result = findNthOccurence(html, tag, count, 0, html.length);
            var elementPosition = result.nextPosition;
            var startPosition = 0;
            if (count > 0) {
                result = findNthOccurence(html, "\n", -1, 0, elementPosition);
                startPosition = result.position;
                lineInFile = result.matchCount + 1;
                result = findNthOccurence(html, "\t", -1, startPosition, elementPosition);
                tabsBeforeColumnInFile = result.matchCount;
            }
            columnInFile = elementPosition - startPosition;
        }
        return {
            line: lineInFile,
            column: columnInFile,
            tabs: tabsBeforeColumnInFile
        };
    }
    function findNthOccurence(range, item, n, start, stop) {
        var position = start;
        var nextPosition = -1;
        var matchCount = 0;
        while (true) {
            nextPosition = range.indexOf(item, position);
            if (nextPosition >= 0) {
                if (nextPosition >= stop) {
                    break;
                }
                matchCount++;
                if (matchCount === n) {
                    break;
                }
                position = nextPosition + 1;
            } else {
                break;
            }
        }
        return {
            position: position,
            nextPosition: nextPosition,
            matchCount: matchCount
        };
    }
    function error(doThrow, text, element, source) {
        var exception = thymol.handleError(new thymol.ThError(doThrow, text, element, source));
        if (!!exception) {
            throw exception;
        }
    }
    function ThError(doThrow, text, element, source) {
        this.name = "ThError";
        this.doThrow = doThrow;
        if (element !== null && typeof element !== "undefined" && element.isBlockChild) {
            this.suppress = true;
        } else {
            this.suppress = false;
        }
        this.element = element || {};
        var message = text || "Default Message";
        if (!this.element.state) {
            this.element.state = new thymol.ThState("", thymol.thDocument);
        }
        this.point = {};
        if (!!this.element.state) {
            this.point = pointInCode(this.element);
            message += "\n\nError in: " + diffTail(thymol.location, this.element.state.file) + " at line: " + this.point.line + " column: " + this.point.column + (this.point.tabs > 0 ? " (" + this.point.tabs + "tabs)" : "");
        }
        this.message = message;
        if (!!source) {
            if (!!source.stack) {
                this.stack = source.stack;
            }
        }
    }
    ThError.prototype = new Error();
    ThError.prototype.constructor = ThError;
    function ThState(filePart, domArg) {
        var fileName = filePart;
        if (filePart != "") {
            if (!filePart.endsWith(thymol.templateSuffix)) {
                fileName = fileName + thymol.templateSuffix;
            }
        } else {
            fileName = thymol.templateName + thymol.templateSuffix;
        }
        this.file = fileName;
        this.content = getFile(fileName);
        this.dom = domArg;
    }
    function ThParam(valueArg) {
        this.value = valueArg;
        this.globalValue;
        this["class"] = new thymol.ThClass("Thymol.ThParam");
        this.getBooleanValue = function() {
            return !thymol.ThUtils.testLiteralFalse(this.value);
        };
        this.toString = function() {
            return this.value;
        };
        this.getNumericValue = function() {
            return Number(this.value);
        };
    }
    function ThAttr(suffix, func, prec, list, pref, dataAttr) {
        var prefix = "", dataPrefix = null, escpPrefix = "";
        if (typeof pref !== "undefined" && pref !== null) {
            prefix = pref + ":";
            if (thymol.thThymeleafPrefixList.indexOf(prefix) < 0) {
                thymol.thThymeleafPrefixList.push(prefix);
            }
            escpPrefix = pref + "\\:";
            if (typeof dataAttr === "undefined" || dataAttr === null) {
                dataPrefix = thymol.dataPrefix + "-" + pref + "-";
                if (thymol.thThymeleafPrefixList.indexOf(dataPrefix) < 0) {
                    thymol.thThymeleafPrefixList.push(dataPrefix);
                }
            } else {
                dataPrefix = dataAttr;
            }
        }
        this.suffix = suffix;
        this.name = prefix + suffix;
        this.regex = null;
        if (suffix.indexOf("*") >= 0 || suffix.indexOf("?") >= 0 || suffix.indexOf("+") >= 0 || suffix.indexOf("\\") >= 0 || suffix.indexOf("|") >= 0 || suffix.indexOf("[") >= 0 || suffix.indexOf("]") >= 0 || suffix.indexOf("{") >= 0 || suffix.indexOf("}") >= 0) {
            if ("*" === suffix) {
                suffix = ".*";
            }
            suffix = prefix + suffix;
            this.regex = new RegExp(suffix);
        }
        this.escpName = "[" + escpPrefix + suffix + "]";
        if (dataPrefix !== null) {
            this.synonym = dataPrefix + suffix;
            this.escpSynonym = "[" + this.synonym + "]";
        } else {
            this.synonym = null;
            this.escpSynonym = null;
        }
        if (typeof prec !== "undefined" && prec !== null) {
            this.precedence = prec;
        } else {
            this.precedence = thymol.thDefaultPrecedence;
        }
        if (!!list) {
            var attrList = list[pref];
            if (!attrList) {
                attrList = [];
                list[pref] = attrList;
                if (dataPrefix !== null) {
                    list[dataPrefix] = attrList;
                }
            }
            attrList.push(this);
        }
        this.process = function() {
            thymol.error(false, 'unsupported processing function for attribute "' + this.name + '"');
        };
        if (!(typeof func === "undefined")) {
            this.process = func;
        }
        this.disable = function() {
            thymol.thDisabledList.push(this);
            this.saveName = this.name;
            this.saveEscpName = this.escpName;
            this.saveEscpSynonym = this.escpSynonym;
            this.saveProcess = this.process;
            this.name = null;
            this.escpName = null;
            this.escpSynonym = null;
            this.process = function() {};
        };
        this.reEnable = function() {
            this.name = this.saveName;
            this.escpName = this.saveEscpName;
            this.escpSynonym = this.saveEscpSynonym;
            this.process = this.saveProcess;
        };
    }
    function ThElement(suffix, func, pref) {
        var tha = new thymol.ThAttr(suffix, null, 0, null, pref);
        this.name = tha.name;
        this.synonym = tha.synonym;
        this.endName = "/" + tha.name;
        this.endSynonym = "/" + tha.synonym;
        this.process = function() {
            thymol.error(false, 'unsupported processing function for element "' + this.name + '"');
        };
        if (!(typeof func === "undefined")) {
            this.process = func;
        }
        this.disable = function() {
            this.name = null;
            this.synonym = null;
            this.endName = null;
            this.endSynonym = null;
            this.process = null;
        };
        thymol.thThymeleafElementsList.push(this);
    }
    function ThSet() {
        this.that = this;
        this.setSize = 0;
        this.isContent = function(k) {
            return this.hasOwnProperty(k) && typeof this[k] !== "function" && k !== "that" && k !== "setSize";
        };
        this.add = function(k) {
            var contained = typeof this[k] !== "undefined";
            this[k] = k;
            if (contained !== (typeof this[k] !== "undefined")) {
                this.setSize++;
            }
        };
        this.addAll = function(other) {
            var k = null, value;
            for (k in other) {
                if (other.hasOwnProperty(k)) {
                    value = other[k];
                    if (typeof value !== "function") {
                        add(value);
                    }
                }
            }
        };
        this.clear = function() {
            for (var k in this) {
                if (this.hasOwnProperty(k)) {
                    delete this[k];
                }
            }
            setSize = 0;
        };
        this.contains = function(k) {
            return typeof this[k] !== "undefined";
        };
        this.containsAll = function(keys) {
            var keySet = keys, k = null;
            if (typeof keys === "Array" || Object.prototype.toString.call(keys) === "[object Array]") {
                keySet = ThSet.prototype.fromArray(keys);
            }
            for (k in keySet) {
                if (keySet.hasOwnProperty(k)) {
                    if (typeof this[k] === "undefined") {
                        return false;
                    }
                }
            }
            return true;
        };
        this.isEmpty = function() {
            return this.setSize === 0;
        };
        this.size = function() {
            return this.setSize;
        };
        this.remove = function(k) {
            var contained = typeof this[k] !== "undefined";
            delete this[k];
            if (contained !== (typeof this[k] !== "undefined")) {
                this.setSize--;
            }
        };
        this.toArray = function() {
            return getArray(this);
        };
        this.toString = function() {
            var array = getArray();
            return array.toString();
        };
        function getArray(obj) {
            var array = [], k = null, value;
            for (k in obj) {
                if (obj.hasOwnProperty(k) && k !== "that" && k !== "setSize") {
                    value = obj[k];
                    if (typeof value !== "function") {
                        array.push(value);
                    }
                }
            }
            return array;
        }
    }
    ThSet.prototype.fromArray = function(array) {
        var set = new thymol.ThSet(), i, iLimit;
        for (i = 0, iLimit = array.length; i < iLimit; i++) {
            set.add(array[i]);
        }
        return set;
    };
    function ThMap() {
        ThSet.apply(this);
        this.containsKey = function(k) {
            return this.contains(k);
        };
        this.containsValue = function(target) {
            var k = null, value;
            for (k in this.that) {
                if (this.that.hasOwnProperty(k) && k !== "that") {
                    value = this.that[k];
                    if (value === target) {
                        return true;
                    }
                }
            }
            return false;
        };
        this.entrySet = function() {
            return this.that;
        };
        this.get = function(k) {
            return this.that[k];
        };
        this.keySet = function() {
            return this.that;
        };
        this.put = function(k, v) {
            var contained = typeof this[k] !== "undefined";
            this.that[k] = v;
            if (contained !== (typeof this[k] !== "undefined")) {
                this.setSize++;
            }
        };
        this.putAll = function(t) {
            for (var k in t) {
                put(k, t[k]);
            }
        };
        this.values = function() {
            return this.that;
        };
    }
    ThMap.prototype = new ThSet();
    ThMap.prototype.constructor = ThMap;
    function ThObject(dolly) {
        for (prop in dolly) {
            if (dolly.hasOwnProperty(prop)) {
                if (prop) {
                    if (!this[prop]) {
                        this[prop] = dolly[prop];
                    }
                }
            }
        }
        this["class"] = new thymol.ThClass("Thymol.ThObject");
        this.toNonThObject = function() {
            var plain = {};
            for (prop in this) {
                if (this.hasOwnProperty(prop)) {
                    if (prop) {
                        if (!plain[prop]) {
                            if (prop !== "toNonThObject") {
                                if (prop !== "class" || prop === "class" && this[prop] !== null && this[prop].name !== "Thymol.ThObject") {
                                    plain[prop] = this[prop];
                                }
                            }
                        }
                    }
                }
            }
            return plain;
        };
    }
    function ThVarsAccessor(storeArg, storeNameArg) {
        this.store = storeArg;
        this.arrayName = storeNameArg;
        this.length = function() {
            return this.store.length;
        };
        this.get = function(name) {
            return this.store[name];
        };
        this.set = function(name, value) {
            this.store[name] = value;
        };
    }
    function ThClass(nValue) {
        this.name = nValue;
    }
    return {
        Thymol: Thymol,
        ThError: ThError,
        ThState: ThState,
        ThParam: ThParam,
        ThAttr: ThAttr,
        ThElement: ThElement,
        ThSet: ThSet,
        ThMap: ThMap,
        ThObject: ThObject,
        ThVarsAccessor: ThVarsAccessor,
        ThClass: ThClass,
        fileSystem: thymol.fileSystem,
        getFileContent: thymol.getFileContent,
        getXMLHttpRequest: thymol.getXMLHttpRequest,
        thDomParse: thymol.thDomParse,
        thDocument: thymol.thDocument,
        thWindow: thymol.thWindow,
        thTop: thymol.thTop,
        thRequest: thymol.thRequest,
        thVersion: thymol.thVersion,
        thReleaseDate: thymol.thReleaseDate,
        thURL: thymol.thURL,
        thAltURL: thymol.thAltURL,
        thFragment: thymol.thFragment,
        thRemove: thymol.thRemove,
        thBlock: thymol.thBlock,
        thScriptName: thymol.thScriptName,
        thDefaultPrefix: thymol.thDefaultPrefix,
        thDefaultDataPrefix: thymol.thDefaultDataPrefix,
        thDefaultPrecision: thymol.thDefaultPrecision,
        thDefaultProtocol: thymol.thDefaultProtocol,
        thDefaultLocale: thymol.thDefaultLocale,
        thDefaultPrecedence: thymol.thDefaultPrecedence,
        thDefaultMessagePath: thymol.thDefaultMessagePath,
        thDefaultResourcePath: thymol.thDefaultResourcePath,
        thDefaultMessagesBaseName: thymol.thDefaultMessagesBaseName,
        thDefaultRelativeRootPath: thymol.thDefaultRelativeRootPath,
        thDefaultExtendedMapping: thymol.thDefaultExtendedMapping,
        thDefaultLocalMessages: thymol.thDefaultLocalMessages,
        thDefaultDisableMessages: thymol.thDefaultDisableMessages,
        thDefaultTemplateSuffix: thymol.thDefaultTemplateSuffix,
        thDefaultInlineQuote: thymol.thDefaultInlineQuote,
        thThymeleafPrefixList: thymol.thThymeleafPrefixList,
        thDisabledList: thymol.thDisabledList,
        thThymeleafElementsList: thymol.thThymeleafElementsList,
        thImportAttrList: thymol.thImportAttrList,
        thLocation: thymol.thLocation,
        varParExpr: thymol.varParExpr,
        messagePath: thymol.messagePath,
        resourcePath: thymol.resourcePath,
        relativeRootPath: thymol.relativeRootPath,
        messagesBaseName: thymol.messagesBaseName,
        extendedMapping: thymol.extendedMapping,
        scriptPath: thymol.scriptPath,
        absolutePath: thymol.absolutePath,
        useAbsolutePath: thymol.useAbsolutePath,
        useFullURLPath: thymol.useFullURLPath,
        localMessages: thymol.localMessages,
        indexFile: thymol.indexFile,
        disableMessages: thymol.disableMessages,
        templateSuffix: thymol.templateSuffix,
        prefix: thymol.prefix,
        dataPrefix: thymol.dataPrefix,
        templateName: thymol.templateName,
        templatePath: thymol.templatePath,
        objects: thymol.objects,
        reset: reset,
        setup: setup,
        execute: execute,
        error: error,
        isClientSide: isClientSide,
        updatePrefix: updatePrefix,
        init: init,
        ready: ready,
        addDialect: addDialect,
        getFile: getFile,
        loadScript: loadScript,
        isFragmentChild: isFragmentChild,
        preProcess: preProcess,
        substitute: substitute,
        substituteParam: substituteParam,
        configureModule: configureModule,
        configureAttributeProcessor: configureAttributeProcessor,
        configureElementProcessor: configureElementProcessor,
        configurePreExecution: configurePreExecution,
        configurePostExecution: configurePostExecution,
        getStandardURL: getStandardURL,
        getMessage: getMessage,
        getExpression: getExpression,
        getWith: getWith,
        getParsedExpr: getParsedExpr,
        getLocale: getLocale,
        getMapped: getMapped,
        getBooleanValue: getBooleanValue,
        setLocale: setLocale
    };
}();

thymol.makeContext = function(contextNameParam, varAccessorParam) {
    const jsonDeclSpec = "(?:\\W*([\\'][A-Za-z]+(?:\\w|[$])*[\\'])\\s*[:])?\\s*([#][A-Za-z]+(?:\\w|[$])*)(?:\\W|[^$])*", jsonDeclExpr = new RegExp(jsonDeclSpec), context = new Array();
    context.contextName = contextNameParam;
    context.varAccessor = varAccessorParam;
    context.varStore = [];
    context.varNamePrefix = "";
    if (typeof varAccessorParam === "undefined") {
        context.varAccessor = new thymol.ThVarsAccessor(context.varStore, "varStore");
    }
    context.varNamePrefix = context.varAccessor.arrayName + "[";
    context.getJSONView = function(param, rootVal) {
        var pType = typeof param, view = "", objType;
        if (pType === "string") {
            view = view + "'" + param + "'";
        } else if (pType === "number" || pType === "boolean") {
            view = view + param;
        } else if (pType === "object") {
            if (param instanceof Object) {
                objType = Object.prototype.toString.call(param);
                if ("[object Array]" === objType) {
                    view = this.getJSONViewArray(param, false);
                } else if ("[object Object]" === objType) {
                    view = this.getJSONViewObject(param, false);
                }
                view = "#" + view;
            }
        }
        return view;
    };
    context.init = function() {
        var persisted = thymol.thTop.name, paramRow, paramName, params, i, iLimit, paramValue;
        if (persisted && persisted !== "") {
            params = this.javascriptify(persisted);
            if (params && params.length > 0) {
                for (i = 0, iLimit = params.length; i < iLimit; i++) {
                    paramRow = params[i];
                    if (paramRow) {
                        paramName = paramRow[0];
                        if (paramName) {
                            paramValue = paramRow[1];
                            this.createVariable(paramName, paramValue);
                        }
                    }
                }
            }
        }
    };
    context.getJSONViewObject = function(param, rootVal) {
        var isRoot = true, key = null, view = "{", value, identifier, definition, suffix, instanceNamePrefix, isTaken, i, iLimit, instanceValue;
        if (typeof rootVal === "boolean") {
            isRoot = rootVal;
        }
        for (key in param) {
            if (key) {
                value = param[key];
                if (typeof value !== "function") {
                    if (view != "{") {
                        view = view + ",";
                    }
                    identifier = this.getJSONView(key, false);
                    definition = this.getJSONView(value, false);
                    view = view + identifier + ":";
                    if (!isRoot && typeof value === "object") {
                        suffix = 1;
                        instanceNamePrefix = key + "$";
                        instanceName = null;
                        isTaken = false;
                        do {
                            instanceName = instanceNamePrefix + suffix++;
                            instanceValue = context[instanceName];
                            if (instanceValue === null || typeof instanceValue === "undefined") {
                                isTaken = false;
                                for (i = 0, iLimit = context.varStore.length; i < iLimit; i++) {
                                    if (instanceName === context.varStore[i][0]) {
                                        isTaken = true;
                                        break;
                                    }
                                }
                                if (!isTaken) {
                                    this.addAttribute(instanceName, definition);
                                }
                            }
                        } while (isTaken);
                        if (instanceName !== null) {
                            view = view + "#" + instanceName;
                        }
                    } else {
                        view = view + definition;
                    }
                }
            }
        }
        view = view + "}";
        return view;
    };
    context.getJSONViewArray = function(param, rootVal) {
        var view = "[", i;
        for (i = 0; i < param.length; i++) {
            view = view + this.getJSONView(param[i], false);
            if (i < param.length - 1) {
                view = view + ",";
            }
        }
        view = view + "]";
        return view;
    };
    context.getAttribute = function(name) {
        return context[name];
    };
    context.addAttribute = function(name, value) {
        var entry = [];
        entry[0] = name;
        entry[1] = value;
        context.varStore.push(entry);
    };
    context.serialise = function() {
        context.varStore = [];
        var serialised = "[", key = null, value, cn, view, name, i, iLimit;
        for (key in context) {
            if (key) {
                value = context[key];
                if (value != null && typeof value === "object") {
                    cn = Object.prototype.toString.call(value);
                    if ("[object Array]" !== cn && !(value instanceof thymol.ThClass) && !(value instanceof thymol.ThVarsAccessor)) {
                        if (serialised !== "[") {
                            serialised = serialised + ",";
                        }
                        view = this.getJSONView(value, true);
                        serialised = serialised + "[";
                        serialised = serialised + '"' + key + '"';
                        serialised = serialised + ",";
                        serialised = serialised + '"' + view + '"';
                        serialised = serialised + "]";
                    }
                }
            }
        }
        for (i = 0, iLimit = context.varStore.length; i < iLimit; i++) {
            name = context.varStore[i][0];
            view = context.varStore[i][1];
            serialised = serialised + ",[";
            serialised = serialised + '"' + name + '"';
            serialised = serialised + ",";
            serialised = serialised + '"' + view + '"';
            serialised = serialised + "]";
        }
        serialised = serialised + "]";
        return serialised;
    };
    context.javascriptify = function(fn) {
        try {
            return new Function("return " + fn)();
        } catch (err) {
            return undefined;
        }
    };
    context.createVariable = function(name, valParam, isReq) {
        var value = valParam, param, tt, literalBoolean, strValue, initial, existing, newArray;
        param = value;
        if (!(value instanceof thymol.ThParam)) {
            tt = typeof valParam;
            if (tt !== "function" && tt !== "object") {
                if (tt === "string") {
                    try {
                        value = isReq ? decodeURIComponent(value) : decodeURI(value);
                    } catch (err) {}
                }
                if (tt === "boolean" || tt === "number") {
                    param = new thymol.ThParam(value);
                } else if (value || value === "") {
                    literalBoolean = thymol.ThUtils.testLiteralFalse(value);
                    if (literalBoolean) {
                        param = false;
                    } else {
                        strValue = new String(value);
                        initial = strValue.trim();
                        if (initial.charAt(0) === "#") {
                            initial = initial.substring(1);
                            try {
                                param = this.createJSONVariable(initial);
                            } catch (err) {
                                if (err instanceof ReferenceError) {}
                                if (err instanceof EvalError) {}
                                if (param == null || isReq) {
                                    param = new thymol.ThParam(value);
                                }
                            }
                        } else {
                            param = new thymol.ThParam(strValue.toString());
                        }
                    }
                }
            }
        }
        if (isReq) {
            existing = context[name];
            if (typeof existing !== "undefined" && existing !== null) {
                if (Object.prototype.toString.call(existing) === "[object Array]") {
                    existing.push(param);
                } else {
                    thymol.error(false, 'request parameters should be of type string array "' + name + '"');
                }
            } else {
                newArray = new Array();
                newArray["class"] = {};
                newArray["class"]["name"] = "[Thymol.ThParam]";
                newArray.push(param);
                context[name] = newArray;
            }
        } else {
            context[name] = param;
        }
        return param;
    };
    context.createJSONVariable = function(initial) {
        var current = initial.trim(), parts = " ", substIndex, token, re, vName, obj, result;
        substIndex = context.varAccessor.length() + 1;
        while (parts) {
            parts = current.match(jsonDeclExpr);
            if (parts && parts.length > 2) {
                token = parts[2];
                token = token.replace(/[\']/g, "[']").replace(/[$]/g, "[$]");
                re = new RegExp(token);
                vName = context.varNamePrefix + substIndex + "]";
                obj = new Object();
                obj.name = parts[2].substring(1);
                context.varAccessor.set(substIndex, obj);
                substIndex = substIndex + 1;
                current = current.replace(re, "'" + vName + "'", "g");
            }
        }
        current = current.replace(/[\']/g, '"');
        result = JSON.parse(current);
        if ("[object Array]" !== Object.prototype.toString.call(result)) {
            result = new thymol.ThObject(result);
        }
        return result;
    };
    context.resolveJSONReferences = function() {
        var key = null, param, prop = null, val, ref, subst, isReq = "request" === context.contextName;
        for (key in context) {
            if (key) {
                param = context[key];
                if (param != null && typeof param === "object") {
                    if (!(param instanceof thymol.ThVarsAccessor) && !(param instanceof thymol.ThClass)) {
                        if (!(param instanceof thymol.ThParam)) {
                            if (isReq && Object.prototype.toString.call(param) === "[object Array]") {
                                for (var i = 0, iLimit = param.length; i < iLimit; i++) {
                                    var pi = param[i];
                                    if (!!pi && typeof pi.value === "string" && pi.value.charAt(0) == "#") {
                                        var pv = thymol.ThUtils.getParameter(pi.value.substring(1));
                                        param[i] = pv;
                                    }
                                }
                            } else {
                                for (prop in param) {
                                    if (prop) {
                                        val = param[prop];
                                        if (typeof val === "string") {
                                            if (val.indexOf(context.varNamePrefix) == 0) {
                                                subst = null;
                                                if (prop.match(/\d*/)) {
                                                    ref = val.substring(context.varNamePrefix.length, val.length - 1);
                                                    ref = context.varAccessor.get(ref);
                                                    subst = context[ref.name];
                                                } else {
                                                    subst = context[prop];
                                                }
                                                param[prop] = subst;
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (typeof param.value === "string" && param.value.charAt(0) == "#") {
                            subst = context[param.value.substring(1)];
                            context[key] = subst;
                        }
                    }
                }
            }
        }
    };
    return context;
};

thymol.ThUtils = function() {
    function mergeVars(thiz, other) {
        var current = thiz, prop = null;
        if (!current) {
            current = {};
        }
        for (prop in other) {
            if (other.hasOwnProperty(prop)) {
                if (prop) {
                    if (!current[prop]) {
                        current[prop] = other[prop];
                    }
                }
            }
        }
        return current;
    }
    function processElement(func, element, arg, obj) {
        var result = null, parent = element.parentElement;
        if (!thymol.isFragmentChild(element)) {
            if (!element.thObjectVar) {
                parent = element.parentElement;
                while (parent) {
                    if (parent.thObjectVar) {
                        element.thObjectVar = parent.thObjectVar;
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
            parent = element.parentElement;
            while (parent) {
                if (parent.thLocalVars) {
                    element.thLocalVars = mergeVars(element.thLocalVars, parent.thLocalVars);
                    break;
                }
                parent = parent.parentElement;
            }
            result = func(element, arg, obj);
        }
        return result;
    }
    function unQuote(param) {
        var par = param, pared;
        if (par) {
            if (typeof par === "string") {
                par = par.trim();
                if (par.charAt(0) == '"') {
                    if (par.charAt(par.length - 1) == '"') {
                        pared = par.substring(1, par.length - 1);
                        if (pairParity(pared, '"', '"') == 0) {
                            par = pared;
                        }
                    }
                } else if (par.charAt(0) == "'") {
                    if (par.charAt(par.length - 1) == "'") {
                        pared = par.substring(1, par.length - 1);
                        if (pairParity(pared, "'", "'") == 0) {
                            par = pared;
                        }
                    }
                }
            }
        }
        return par;
    }
    function unParenthesise(param) {
        var par = param, pared;
        if (par) {
            if (typeof par === "string") {
                par = par.trim();
                if (par.charAt(0) == "(") {
                    if (par.charAt(par.length - 1) == ")") {
                        pared = par.substring(1, par.length - 1).trim();
                        if (pairParity(pared, "(", ")") == 0) {
                            par = pared;
                        }
                    }
                }
            }
        }
        return par;
    }
    function pairParity(str, left, right) {
        var i, ch, strLength = str.length, parity = 0;
        for (i = 0; i < strLength; i++) {
            ch = str.charAt(i);
            if (ch == left) {
                parity++;
            } else if (ch == right) {
                parity--;
                if (parity < 0) {
                    break;
                }
            }
        }
        return parity;
    }
    function unBracket(param) {
        var par = param, pared;
        if (typeof par === "string") {
            par = par.trim();
        }
        if (par) {
            if (par.charAt(0) == "[") {
                if (par.charAt(par.length - 1) == "]") {
                    pared = par.substring(1, par.length - 1);
                    if (pairParity(pared, "[", "]") == 0) {
                        par = pared;
                    }
                }
            }
        }
        return par;
    }
    function getToPrecision(n, p) {
        if (typeof p === "undefined") {
            return n;
        }
        var up = thymol.thDefaultPrecision, ndp = 0, s, sl, dp, v;
        if (p > up) {
            up = p;
        } else {
            s = n.toString();
            sl = s.length;
            dp = s.indexOf(".");
            if (dp >= 0) {
                ndp = sl - 1 - dp;
            }
            if (ndp > up) {
                v = n.toPrecision(ndp + 1);
                v = truncateDecimals(v);
                s = v.toString();
                sl = s.length;
                if (dp >= 0) {
                    ndp = sl - 1 - dp;
                }
            }
            if (p > ndp) {
                up = p;
            } else if (ndp < up) {
                up = ndp;
            }
        }
        v = parseFloat(n);
        v = v.toFixed(up);
        if (p === 0) {
            v = Number(v);
        }
        return v;
    }
    function truncateDecimals(valp) {
        var val = valp, iLimit = valp.length - 1, i;
        for (i = iLimit; i >= 0; i--) {
            if (val.charAt(i) === "0") {
                val = val.substr(0, i);
            } else {
                break;
            }
        }
        return val;
    }
    function getDecimalDigits(val) {
        var digits = 0, s, dp;
        s = val.toString();
        dp = s.indexOf(".") + 1;
        if (dp > 0) {
            digits = s.length - dp;
        }
        return digits;
    }
    function testLiteralFalse(initial) {
        var result = false, val;
        if (typeof initial === "string") {
            val = initial.toLowerCase();
            result = val == "false" || val == "off" || val == "no";
        } else if (typeof initial === "boolean") {
            result = !initial;
        }
        return result;
    }
    function renderMessage(msg, values) {
        var result = msg, i, iLimit;
        if (Object.prototype.toString.call(values) == "[object Array]") {
            for (i = 0, iLimit = values.length; i < iLimit; i++) {
                result = renderMessageArg(result, i, values[i]);
            }
        } else {
            result = renderMessageArg(msg, 0, values);
        }
        return result;
    }
    function renderMessageArg(msg, index, value) {
        var result = msg, splits, i, iLimit, iUpper;
        splits = msg.split("{" + index + "}");
        if (splits.length > 0) {
            result = "";
            for (i = 0, iLimit = splits.length, iUpper = iLimit - 1; i < iLimit; i++) {
                result += splits[i];
                if (i < iUpper) {
                    result += value;
                }
            }
        }
        return result;
    }
    function getParameter(name) {
        var result, tor;
        if (!!thymol.requestContext) {
            result = thymol.requestContext[name];
            if (Object.prototype.toString.call(result) === "[object Array]") {
                if (result.length === 1) {
                    result = result[0];
                }
            }
        }
        tor = typeof result;
        if (tor === "undefined") {
            if (!!thymol.sessionContext) {
                result = thymol.sessionContext[name];
            }
            if (typeof result === "undefined") {
                if (!!thymol.sessionContext) {
                    result = thymol.applicationContext[name];
                }
            }
        }
        return result;
    }
    function charOcurrences(str, chr) {
        var count = 0, i = 0, iLimit = str.length;
        for (;i < iLimit; i++) {
            if (str.charAt(i) === chr) {
                count++;
            }
        }
        return count;
    }
    function isLiteral(val) {
        var first, last;
        if (typeof val === "string") {
            first = val.charAt(0);
            last = val.charAt(val.length - 1);
            if (first == "'" && last == "'") {
                return true;
            }
            if (first == '"' && last == '"') {
                return true;
            }
        }
        return false;
    }
    function isLiteralSubst(param) {
        var result = false, par = param;
        if (typeof par === "string") {
            par = par.trim();
        }
        if (par) {
            if (par.charAt(0) == "|") {
                if (par.charAt(par.length - 1) == "|") {
                    result = true;
                }
            }
        }
        return result;
    }
    function resolvePath(path) {
        if (path.indexOf(".") == 0) {
            return path;
        }
        var protoPos = path.indexOf("://");
        var proto = "";
        if (protoPos >= 0) {
            protoPos += 3;
            proto = path.substring(0, protoPos);
            path = path.substring(protoPos);
        }
        path = path.replace(/\/\//g, "/");
        var dotPos = path.indexOf("..");
        var base = path.substring(0, dotPos - 1);
        var relative = path.substring(dotPos);
        var stack = base.split("/"), parts = relative.split("/");
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] == "." || parts[i].length == 0) {
                continue;
            }
            if (parts[i] == "..") {
                stack.pop();
            } else {
                stack.push(parts[i]);
            }
        }
        return proto + stack.join("/");
    }
    function unescape(text) {
        var result = text, i, iLimit, iUpper, c, cc;
        if (text !== null && typeof text !== "undefined") {
            result = "";
            iLimit = text.length;
            iUpper = iLimit - 3;
            for (i = 0; i < iLimit; i++) {
                c = text.charAt(i);
                if (i < iUpper) {
                    if (c === "&") {
                        cc = text.charAt(i + 1).toLowerCase();
                        if ((cc === "g" || cc === "l") && text.charAt(i + 2).toLowerCase() === "t" && text.charAt(i + 3) === ";") {
                            i += 3;
                            if (cc === "g") {
                                c = ">";
                            } else {
                                c = "<";
                            }
                        } else if (i < iUpper - 1 && cc === "a" && text.charAt(i + 2).toLowerCase() === "m" && text.charAt(i + 3).toLowerCase() === "p" && text.charAt(i + 4) === ";") {
                            i += 4;
                        } else if (i < iUpper - 2) {
                            if (cc === "q" && text.charAt(i + 2).toLowerCase() === "u" && text.charAt(i + 3).toLowerCase() === "o" && text.charAt(i + 4).toLowerCase() === "t" && text.charAt(i + 5) === ";") {
                                i += 5;
                                c = '"';
                            } else if (cc === "a" && text.charAt(i + 2).toLowerCase() === "p" && text.charAt(i + 3).toLowerCase() === "o" && text.charAt(i + 4).toLowerCase() === "s" && text.charAt(i + 5) === ";") {
                                i += 5;
                                c = "'";
                            }
                        }
                    }
                }
                result += c;
            }
        }
        return result;
    }
    function unicodeUnescape(initial) {
        var result = initial.replace(/\\u([\da-f]{4})/gi, function(match, grp) {
            return String.fromCharCode(parseInt(grp, 16));
        });
        result = unescape(result);
        return result;
    }
    function removeTag(element) {
        var parent = element.parentNode, i, iLimit, savedObject = element.thObjectVar, savedLocals = element.thLocalVars;
        if (!!parent) {
            for (i = 0, iLimit = element.childNodes.length; i < iLimit; i++) {
                var newNode = element.childNodes[i].cloneNode(true);
                if (newNode.nodeType === 1) {
                    if (!!savedObject) {
                        newNode.thObjectVar = savedObject;
                    }
                    if (!!savedLocals) {
                        newNode.thLocalVars = savedLocals;
                    }
                }
                parent.insertBefore(newNode, element);
            }
            parent.removeChild(element);
        }
    }
    function getRequestEncoded(initial) {
        var result = initial;
        result = encodeURIComponent(result);
        result = result.replace(/%26/g, "&");
        result = result.replace(/%3A/g, ":");
        result = result.replace(/!/g, "%21");
        result = result.replace(/'/g, "%27");
        result = result.replace(/\*/g, "%2A");
        result = result.replace(/~/g, "%7E");
        return result;
    }
    return {
        getParameter: getParameter,
        processElement: processElement,
        unQuote: unQuote,
        unParenthesise: unParenthesise,
        unBracket: unBracket,
        getToPrecision: getToPrecision,
        getDecimalDigits: getDecimalDigits,
        testLiteralFalse: testLiteralFalse,
        renderMessage: renderMessage,
        charOcurrences: charOcurrences,
        isLiteral: isLiteral,
        isLiteralSubst: isLiteralSubst,
        resolvePath: resolvePath,
        unescape: unescape,
        unicodeUnescape: unicodeUnescape,
        removeTag: removeTag,
        getRequestEncoded: getRequestEncoded
    };
}();

thymol.ThParser = function(scope) {
    function object(o) {
        function F() {}
        F.prototype = o;
        return new F();
    }
    function NullReturn(varName) {
        this.varName = varName;
    }
    const TNUMBER = 0;
    const TOP1 = 1;
    const TOP2 = 2;
    const TVAR = 3;
    const TFUNCALL = 4;
    const MSGSUBST = 5;
    const ARGLIST = 6;
    function Token(type_p, index_p, prio_p, number_p, mode_p, meta_p) {
        this.type_ = type_p;
        this.index_ = index_p || 0;
        this.prio_ = prio_p || 0;
        this.number_ = number_p !== undefined && number_p !== null ? number_p : 0;
        this.mode_ = mode_p !== undefined && mode_p !== null ? mode_p : 0;
        this.meta_ = meta_p;
        this.toString = function() {
            switch (this.type_) {
              case TNUMBER:
                return this.number_;

              case TOP1:
              case TOP2:
              case TVAR:
                return this.index_;

              case TFUNCALL:
              case MSGSUBST:
              case ARGLIST:
                return "CALL";

              default:
                return "Invalid Token";
            }
        };
    }
    function Expression(tokens, ops1, ops2, functions, precision, position) {
        this.tokens = tokens;
        this.ops1 = ops1;
        this.ops2 = ops2;
        this.functions = functions;
        this.precision = precision;
        this.position = position;
    }
    Expression.prototype = {
        simplify: function(valuesParam) {
            var values = valuesParam || {};
            var nstack = [];
            var newexpression = [];
            var n1;
            var n2;
            var f;
            var L = this.tokens.length;
            var item;
            var i = 0;
            for (i = 0; i < L; i++) {
                item = this.tokens[i];
                var type_ = item.type_;
                if (type_ === TNUMBER) {
                    nstack.push(item);
                } else if (type_ === TVAR && !(item.index_ in new Object()) && item.index_ in values) {
                    item = new Token(TNUMBER, 0, 0, values[item.index_]);
                    nstack.push(item);
                } else if (type_ === TOP2 && nstack.length > 1) {
                    f = this.ops2[item.index_];
                    if (!!f) {
                        n2 = nstack.pop();
                        n1 = nstack.pop();
                        item = new Token(TNUMBER, 0, 0, f(n1.number_, n2.number_));
                    }
                    nstack.push(item);
                } else if (type_ === TOP1 && nstack.length > 0) {
                    if ("{" == item.index_) {
                        if (item.mode_ == 2) {
                            nstack.push(item);
                        }
                    } else {
                        n1 = nstack.pop();
                        f = this.ops1[item.index_];
                        item = new Token(TNUMBER, 0, 0, f(n1.number_));
                        nstack.push(item);
                    }
                } else {
                    while (nstack.length > 0) {
                        newexpression.push(nstack.shift());
                    }
                    newexpression.push(item);
                }
            }
            while (nstack.length > 0) {
                newexpression.push(nstack.shift());
            }
            var res = new Expression(newexpression, object(this.ops1), object(this.ops2), object(this.functions), this.precision);
            return res;
        },
        evaluate: function(element) {
            var nstack = [];
            var n1;
            var n2;
            var f;
            var res = null;
            var L = this.tokens.length;
            var item;
            var i = 0;
            var result;
            for (i = 0; i < L; i++) {
                item = this.tokens[i];
                if (i === 0 && thymol.disableMessages && item.mode_ === 4) {
                    var nullReturn = new thymol.ThClass();
                    nullReturn.abort = true;
                    return nullReturn;
                }
                var type_ = item.type_;
                if (type_ === TNUMBER) {
                    nstack.push(item.number_);
                    if (i == L - 1) {
                        break;
                    }
                } else if (type_ === TOP2) {
                    n2 = nstack.pop();
                    if (typeof n2 === "undefined" || n2 instanceof NullReturn) {
                        n2 = null;
                    }
                    n1 = nstack.pop();
                    if (typeof n1 === "undefined" || n1 instanceof NullReturn) {
                        n1 = null;
                    }
                    f = this.ops2[item.index_];
                    var pathMatch = false;
                    try {
                        if (item.mode_ === 6) {
                            if (f === dot) {
                                res = n1 + "[" + n2 + "]";
                            } else if (f === append) {
                                if (!!item.meta_) {
                                    if (!!item.meta_.paths) {
                                        var values = item.meta_.paths[n1];
                                        if (!!values) {
                                            values.push(n2);
                                            pathMatch = true;
                                            res = null;
                                        }
                                    }
                                }
                                if (!pathMatch) {
                                    if (!item.meta_) {
                                        item.meta_ = {};
                                    }
                                    if (!item.meta_.params) {
                                        item.meta_.params = [];
                                    }
                                    var values = item.meta_.params[n1];
                                    if (!values) {
                                        values = [];
                                        item.meta_.params[n1] = values;
                                    }
                                    values.push(n2);
                                    pathMatch = true;
                                }
                            } else {
                                res = n2;
                                nstack.push(n1);
                            }
                        } else {
                            if (f === dot && "class" === n2 && !!n1 && !n1["class"]) {
                                var tn2 = typeof n2;
                                if (tn2 === "object" && n2 instanceof thymol.ThParam) {
                                    res = f(n1, n2);
                                } else {
                                    res = new thymol.ThClass("JavaScript:" + tn2);
                                }
                            } else {
                                res = f(n1, n2);
                                if (typeof res === "function") {
                                    if (L - 1 > i) {
                                        next = this.tokens[i + 1];
                                        if (next.type_ === TNUMBER && Object.prototype.toString.call(next.number_) == "[object Array]" && next.number_.length == 0) {
                                            i += 1;
                                            nstack.push(res);
                                            n1.isDirect = true;
                                            res = n1;
                                        }
                                    }
                                }
                            }
                            if (f !== append) {
                                if (Object.prototype.toString.call(res) == "[object Array]") {
                                    res.arrayResult = true;
                                }
                            }
                        }
                    } catch (err) {
                        if (!element.isBlockChild) {
                            var aValue = n1 == null ? "null" : n1;
                            var bValue = n2 == null ? "null" : n2;
                            var message = "while evaluating binary expression: " + this.tokens[i - 2].index_ + ": " + aValue + ", " + this.tokens[i - 1].index_ + ": " + bValue;
                            thymol.error(true, message, element, err);
                        }
                    }
                    if (!pathMatch) {
                        nstack.push(res);
                    }
                } else if (type_ === TVAR) {
                    var next = null, pushed = nstack.length;
                    if (item.index_ != null) {
                        if (L - 1 > i) {
                            next = this.tokens[i + 1];
                            if (next.type_ === TOP2 && next.index_ === ".") {
                                nstack.push(item.index_);
                            }
                        }
                        if (pushed === nstack.length) {
                            var val = thymol.substituteParam(item.index_, item.mode_, element);
                            if (Object.prototype.toString.call(val) == "[object Array]") {
                                val.arrayResult = true;
                            }
                            this.updatePrecision(val);
                            if (val === null) {
                                val = new NullReturn(item.index_);
                            }
                            nstack.push(val);
                        }
                    } else if (pushed === nstack.length && item.index_ in this.functions) {
                        nstack.push(this.functions[item.index_]);
                    } else {
                        if (!element.isBlockChild) {
                            thymol.error(true, "Exception undefined variable: " + item.index_, element);
                        }
                    }
                } else if (type_ === TOP1) {
                    n1 = nstack.pop();
                    if (typeof n1 === "undefined" || n1 instanceof NullReturn) {
                        if (item.mode_ === 2) {
                            n1 = "";
                        } else {
                            n1 = null;
                        }
                    }
                    res = n1;
                    if ("{" === item.index_) {
                        var prev = this.tokens[i - 1];
                        if (prev.mode_ == 7) {
                            if (thymol.conversionService) {
                                n1 = thymol.conversionService(n1);
                                res = n1;
                            }
                        }
                        if (typeof n1 === "string") {
                            if (item.mode_ === 2) {
                                res = thymol.getStandardURL(n1);
                            } else {
                                var subst = thymol.substituteParam(n1, item.mode_, element);
                                if (subst != null) {
                                    this.updatePrecision(subst);
                                    res = subst;
                                }
                            }
                        }
                    } else {
                        f = this.ops1[item.index_];
                        try {
                            res = f(n1);
                        } catch (err) {
                            if (!element.isBlockChild) {
                                var aValue = n1 == null ? "null" : n1;
                                var message = "while evaluating unary expression: " + this.tokens[i - 2].index_ + ": " + aValue;
                                thymol.error(true, message, element, err);
                            }
                        }
                    }
                    if (Object.prototype.toString.call(res) == "[object Array]") {
                        res.arrayResult = true;
                    }
                    nstack.push(res);
                } else if (type_ === TFUNCALL || type_ === MSGSUBST || type_ === ARGLIST) {
                    n1 = nstack.pop();
                    f = nstack.pop();
                    if (type_ === MSGSUBST) {
                        if (f instanceof NullReturn) {
                            res = "??" + f.varName + "_" + thymol.locale.value + "??";
                        } else {
                            res = thymol.ThUtils.renderMessage(f, n1);
                        }
                        nstack.push(res);
                    } else if (type_ === ARGLIST) {
                        var pathMatch = false;
                        n2 = nstack.pop();
                        if (typeof n2 === "undefined") {
                            n2 = f;
                            f = n1;
                            n1 = "";
                        }
                        if (!!item.meta_) {
                            if (!!item.meta_.paths) {
                                var values = item.meta_.paths[f];
                                if (!!values) {
                                    values.push(n1);
                                    pathMatch = true;
                                }
                                for (var j in item.meta_.paths) {
                                    if (item.meta_.paths.hasOwnProperty(j)) {
                                        var values = item.meta_.paths[j];
                                        var isReq = n2.indexOf("?") >= 0;
                                        if (!!values && values.length > 0) {
                                            var pathVar = "{" + j + "}";
                                            var repReg = new RegExp(pathVar, "g");
                                            var rep = "";
                                            values.reverse();
                                            for (var k = 0, kLimit = values.length; k < kLimit; k++) {
                                                if (rep.length > 0) {
                                                    rep = rep + ",";
                                                }
                                                if (isReq) {
                                                    rep = rep + thymol.ThUtils.getRequestEncoded(values[k]);
                                                } else {
                                                    rep = rep + encodeURIComponent(values[k]);
                                                }
                                            }
                                            n2 = n2.replace(repReg, rep);
                                        }
                                    }
                                }
                            }
                        }
                        if (pathMatch) {
                            res = n2;
                        } else {
                            if (typeof f === "undefined" || f instanceof NullReturn) {
                                f = "";
                            } else {
                                f = f.toString();
                            }
                            f = thymol.ThUtils.getRequestEncoded(f);
                            f = "?" + f;
                            n1 = n1.toString();
                            if (f != "?" && n1 != "") {
                                f = f + "=";
                            }
                            if (n1 != "") {
                                n1 = thymol.ThUtils.getRequestEncoded(n1);
                                f = f + n1;
                            }
                            if (typeof n2 === "undefined" || n2 instanceof NullReturn) {
                                n2 = "";
                            } else {
                                n2 = n2.toString();
                            }
                            res = n2 + f;
                        }
                        if (!!item.meta_) {
                            var separator = res.indexOf("?") >= 0 ? "&" : "?";
                            for (var j in item.meta_.params) {
                                if (item.meta_.params.hasOwnProperty(j)) {
                                    var values = item.meta_.params[j];
                                    if (!!values && values.length > 0) {
                                        for (var k = 0, kLimit = values.length; k < kLimit; k++) {
                                            res = res + separator + thymol.ThUtils.getRequestEncoded(j) + "=" + thymol.ThUtils.getRequestEncoded(values[k]);
                                            if (k == 0) {
                                                separator = "&";
                                            }
                                        }
                                    }
                                }
                            }
                            if (!!item.meta_.urlFragment) {
                                res = res + item.meta_.urlFragment;
                            }
                        }
                        nstack.push(res);
                    } else if (f.apply && f.call) {
                        if (!!n1 && !!n1.isDirect) {
                            res = f.call(n1);
                        } else {
                            if (n1 instanceof NullReturn) {
                                n1 = null;
                            }
                            if (n1 != null && (n1.arrayResult || Object.prototype.toString.call(n1) !== "[object Array]")) {
                                res = f.call(element, n1);
                            } else {
                                res = f.apply(element, n1);
                            }
                        }
                        if (res instanceof String) {
                            if (res.precision) {
                                if (typeof this.precision === "undefined" || res.precision > this.precision) {
                                    this.precision = res.precision;
                                }
                            }
                            res = res.toString();
                        } else if (Object.prototype.toString.call(res) == "[object Array]") {
                            res.arrayResult = true;
                        }
                        nstack.push(res);
                    } else {
                        if (!element.isBlockChild) {
                            thymol.error(true, f + " is not a function", element);
                        }
                    }
                } else {
                    if (!element.isBlockChild) {
                        thymol.error(true, "invalid expression item type: " + type_, element);
                    }
                }
            }
            if (nstack.length > 1) {
                if (!element.isBlockChild) {
                    thymol.error(true, "invalid Expression (parity)", element);
                }
            }
            result = nstack[0];
            return result;
        },
        updatePrecision: function(val) {
            if (typeof val === "number") {
                var p = thymol.ThUtils.getDecimalDigits(val);
                if (typeof this.precision === "undefined" || p > this.precision) {
                    this.precision = p;
                }
            }
        }
    };
    function add(a, b) {
        return a + b;
    }
    function assign(a) {
        return a;
    }
    function sub(a, b) {
        return a - b;
    }
    function mul(a, b) {
        return a * b;
    }
    function div(a, b) {
        return a / b;
    }
    function mod(a, b) {
        return a % b;
    }
    function concat(a, b) {
        return "" + a + b;
    }
    function neg(a) {
        return -a;
    }
    function not(a) {
        var v = thymol.getBooleanValue(a);
        return !v;
    }
    function random(a) {
        return Math.random() * (a || 1);
    }
    function fac(a) {
        var aa = Math.floor(a);
        var b = aa;
        while (aa > 1) {
            b = b * --aa;
        }
        return b;
    }
    function append(a, b) {
        if (a != null) {
            if (a.arrayResult === true || Object.prototype.toString.call(a) != "[object Array]") {
                return [ a, b ];
            }
        } else {
            if (b != null) {
                if (b.arrayResult === true || Object.prototype.toString.call(b) != "[object Array]") {
                    return [ a, b ];
                }
                return b;
            }
            return null;
        }
        var aa = a.slice();
        aa.push(b);
        return aa;
    }
    function equal(a, b) {
        return a == b;
    }
    function notEqual(a, b) {
        return a != b;
    }
    function gt(a, b) {
        return a > b;
    }
    function ge(a, b) {
        return a >= b;
    }
    function lt(a, b) {
        return a < b;
    }
    function le(a, b) {
        return a <= b;
    }
    function and(a, b) {
        return a && b;
    }
    function or(a, b) {
        return a || b;
    }
    function dot(a, b) {
        return a[b];
    }
    function binary(a, b) {
        return a ? b : null;
    }
    function elvis(a, b) {
        return a != null ? a : b;
    }
    function getStr(pos, expression, mode, partial, preprocessed) {
        var localMode = mode;
        var s = "";
        var c = expression.charAt(pos);
        var start = pos + 1;
        var end = expression.length;
        var stopChar = c;
        if (localMode === 4 || c === "#") {
            stopChar = "}";
            localMode = 4;
        }
        var i = start;
        var inCurly = false;
        var curlyPos = null;
        var urlFragPos = -1;
        var meta = null;
        if (localMode !== 4 && c !== "'" && c !== '"') {
            for (;i <= end; i++) {
                if (c.toUpperCase() === c.toLowerCase()) {
                    if (c === "{") {
                        inCurly = true;
                        curlyPos = i;
                        if (meta === null) {
                            meta = {};
                            meta.paths = [];
                        }
                    } else if (mode === 2 && c === "#") {
                        urlFragPos = i;
                    }
                    if (i === pos || !inCurly && c === "}" || c !== "_" && c !== "?" && c !== ":" && (c < "0" || c > "9")) {
                        if (!(partial && c == "-") && !((mode === 2 || mode === 6) && (c === "/" || c === "." || c === "~" || c === "?" || c === "=" || c === ":" || c === "-" || c === "_" || c === "[" || c === "]" || c === "#" || inCurly && c === "{" || inCurly && c === "}")) || mode === 6 && c === "=") {
                            i = i - 1;
                            break;
                        }
                    }
                    if (inCurly && c === "}") {
                        inCurly = false;
                        if (meta === null) {
                            var message = 'bad path variable definition in expression: "' + expression + '" near column ' + pos;
                            thymol.error(true, message, element);
                        }
                        var curlyVar = expression.substring(curlyPos, i - 1);
                        var values = [];
                        meta.paths[curlyVar] = values;
                    }
                }
                s += c;
                c = expression.charAt(i);
            }
            if (urlFragPos >= 0) {
                var urlFrag = expression.substring(urlFragPos - 1, i);
                s = s.substring(0, s.length - urlFrag.length);
                if (meta === null) {
                    meta = {};
                    meta.urlFragment = urlFrag;
                }
            }
        } else {
            var quoted = false;
            var preprocessing = false;
            if (c === "'" || c === '"') {
                quoted = true;
                stopChar = c;
            }
            while (i <= end) {
                if (c === stopChar && i > start && !preprocessing) {
                    if (localMode !== 4 || quoted) {
                        s += c;
                    } else {
                        i = i - 1;
                    }
                    break;
                }
                var nc = expression.charAt(i);
                if (c === "_" && nc === "_" && !preprocessed) {
                    preprocessing = !preprocessing;
                }
                if (c === "\\") {
                    if (nc === "'" && s.charAt(s.length - 1) !== "\\") {
                        c = "&#39;";
                        if (i + 1 > end) {
                            break;
                        }
                        i = i + 1;
                        nc = expression.charAt(i);
                    }
                }
                if (!quoted) {
                    if (c === ".") {
                        var exp = thymol.thExpressionObjects[s];
                        if (typeof exp !== "undefined" && exp !== null) {
                            i -= 1;
                            break;
                        }
                    }
                    if (c === "(") {
                        i -= 1;
                        break;
                    }
                }
                s += c;
                if (i + 1 > end) {
                    break;
                }
                i = i + 1;
                c = nc;
            }
        }
        var str = new Object();
        str.str = s;
        str.pos = i;
        if (meta !== null) {
            str.meta = meta;
        }
        return str;
    }
    function ThParser() {
        this.precision;
        this.success = false;
        this.errormsg = "";
        this.expression = "";
        this.pos = 0;
        this.tokennumber = 0;
        this.tokenprio = 0;
        this.tokenindex = 0;
        this.tmpprio = 0;
        this.ops1 = {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            sqrt: Math.sqrt,
            log: Math.log,
            abs: Math.abs,
            ceil: Math.ceil,
            floor: Math.floor,
            round: Math.round,
            "-": neg,
            "!": not,
            not: not,
            exp: Math.exp,
            "=": assign
        };
        this.ops2 = {
            "?": binary,
            ":": elvis,
            "?:": elvis,
            "+": add,
            "-": sub,
            "*": mul,
            "/": div,
            "%": mod,
            "^": Math.pow,
            ",": append,
            "||": concat,
            "==": equal,
            eq: equal,
            "!=": notEqual,
            ne: notEqual,
            neq: notEqual,
            div: div,
            mod: mod,
            and: and,
            or: or,
            ">": gt,
            gt: gt,
            ">=": ge,
            "=>": ge,
            ge: ge,
            "<": lt,
            lt: lt,
            "<=": le,
            "=<": le,
            le: le,
            ".": dot,
            "[": dot
        };
        this.functions = {
            random: random,
            fac: fac,
            min: Math.min,
            max: Math.max,
            pow: Math.pow
        };
        this.consts = {
            E: Math.E,
            PI: Math.PI
        };
    }
    ThParser.parse = function(expr, partial, preprocessed) {
        return new thymol.ThParser().parse(expr, partial, preprocessed);
    };
    ThParser.evaluate = function(expr, partial, element) {
        return thymol.ThParser.parse(expr, partial, false).evaluate(element);
    };
    ThParser.Expression = Expression;
    ThParser.values = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        sqrt: Math.sqrt,
        log: Math.log,
        abs: Math.abs,
        ceil: Math.ceil,
        floor: Math.floor,
        round: Math.round,
        random: random,
        fac: fac,
        exp: Math.exp,
        min: Math.min,
        max: Math.max,
        pow: Math.pow,
        E: Math.E,
        PI: Math.PI
    };
    var PRIMARY = 1 << 0;
    var OPERATOR = 1 << 1;
    var FUNCTION = 1 << 2;
    var LPAREN = 1 << 3;
    var RPAREN = 1 << 4;
    var COMMA = 1 << 5;
    var SIGN = 1 << 6;
    var CALL = 1 << 7;
    var NULLARY_CALL = 1 << 8;
    var LBRACK = 1 << 9;
    var RBRACK = 1 << 10;
    var LVARBRK = 1 << 11;
    var RVARBRK = 1 << 11;
    var OPTION = 1 << 12;
    var ASSIGN = 1 << 13;
    ThParser.prototype = {
        parse: function(expr, partial, preprocessed) {
            this.errormsg = "";
            this.success = true;
            var operstack = [];
            var tokenstack = [];
            var modestack = [];
            this.tmpprio = 0;
            var expected = PRIMARY | LPAREN | LVARBRK | FUNCTION | OPERATOR | SIGN | OPTION;
            var noperators = 0;
            this.expression = expr;
            this.pos = 0;
            this.mode = 0;
            while (this.pos < this.expression.length) {
                if (this.isWhite()) {} else if (this.isOperator()) {
                    if (this.isSign() && expected & SIGN) {
                        if (this.isNegativeSign()) {
                            this.tokenprio = 6;
                            this.tokenindex = "-";
                            noperators++;
                            this.addfunc(tokenstack, operstack, TOP1);
                        }
                        expected = PRIMARY | LPAREN | LVARBRK | FUNCTION | SIGN | OPTION;
                    } else if (this.isAssign() && expected & ASSIGN) {
                        noperators++;
                        expected = PRIMARY | LPAREN | LVARBRK | FUNCTION | SIGN | OPTION;
                    } else if (this.isComment()) {} else {
                        if (this.tokenindex == "!") {
                            if ((expected & SIGN) === 0) {
                                this.error_parsing(this.pos, "unexpected sign");
                            }
                            noperators += 1;
                            this.addfunc(tokenstack, operstack, TOP1);
                        } else {
                            if ((expected & OPERATOR) === 0) {
                                this.error_parsing(this.pos, "unexpected operator");
                            }
                            noperators += 2;
                            this.addfunc(tokenstack, operstack, TOP2);
                        }
                        if (this.expression.charAt(this.pos - 1) === "[") {
                            this.tmpprio += 20;
                        }
                        expected = PRIMARY | OPERATOR | LPAREN | LVARBRK | FUNCTION | SIGN | OPTION;
                    }
                } else if (this.isNumber()) {
                    if ((expected & PRIMARY) === 0) {
                        this.error_parsing(this.pos, "unexpected number");
                    }
                    var token = new Token(TNUMBER, 0, 0, this.tokennumber);
                    tokenstack.push(token);
                    expected = OPERATOR | RPAREN | RBRACK | RVARBRK | COMMA;
                } else if (this.isLeftParenth()) {
                    if ((expected & LPAREN) === 0) {
                        this.error_parsing(this.pos, 'unexpected "("');
                    }
                    modestack.push(this.mode);
                    if (expected & CALL) {
                        noperators += 2;
                        this.tokenprio = -2;
                        this.tokenindex = -1;
                        this.tmpprio += 2;
                        var ft = TFUNCALL;
                        if (this.mode === 4) {
                            ft = MSGSUBST;
                            this.mode = 5;
                        } else if (this.mode === 2) {
                            ft = ARGLIST;
                            this.mode = 6;
                            var url = tokenstack[tokenstack.length - 1];
                            if (!url.meta_) {
                                url.meta_ = {};
                            }
                            this.meta = url.meta_;
                        } else {
                            this.mode = 5;
                        }
                        this.addfunc(tokenstack, operstack, ft);
                        this.tmpprio -= 2;
                    }
                    if (this.mode === 5 || this.mode === 6) {
                        this.tmpprio += 10;
                    }
                    expected = PRIMARY | OPERATOR | LPAREN | LVARBRK | FUNCTION | SIGN | OPTION | NULLARY_CALL;
                } else if (this.isRightParenth()) {
                    if (expected & NULLARY_CALL) {
                        var token = new Token(TNUMBER, 0, 0, []);
                        tokenstack.push(token);
                    } else if ((expected & RPAREN) === 0) {
                        this.error_parsing(this.pos, 'unexpected ")"');
                    }
                    if (this.mode === 5 || this.mode === 6) {
                        this.tmpprio -= 10;
                    }
                    this.mode = modestack.pop();
                    expected = OPERATOR | RPAREN | RBRACK | RVARBRK | COMMA | LPAREN | LVARBRK | CALL | OPTION;
                } else if (this.isRightBracket()) {
                    if ((expected & RBRACK) === 0) {
                        this.error_parsing(this.pos, 'unexpected "]"');
                    }
                    expected = OPERATOR | RPAREN | RBRACK | RVARBRK | COMMA | LPAREN | LVARBRK | CALL | OPTION;
                } else if (this.isLeftVarBrk(modestack)) {
                    if ((expected & LVARBRK) === 0) {
                        this.error_parsing(this.pos, 'unexpected "{"');
                    }
                    noperators += 1;
                    this.addfunc(tokenstack, operstack, TOP1);
                    expected = PRIMARY | LPAREN | LVARBRK | FUNCTION | SIGN | OPTION;
                } else if (this.isRightVarBrk()) {
                    if ((expected & RVARBRK) === 0) {
                        this.error_parsing(this.pos, 'unexpected "}"');
                    }
                    this.mode = modestack.pop();
                    expected = FUNCTION | OPERATOR | RPAREN | RBRACK | RVARBRK | COMMA | LPAREN | LVARBRK | CALL | OPTION;
                } else if (this.isLeftCurly()) {
                    if (this.mode == 1 || this.mode == 2 || this.mode == 3 || this.mode == 4) {
                        modestack.push(this.mode);
                        this.mode = 7;
                    } else {
                        this.error_parsing(this.pos, 'unexpected "{"');
                    }
                } else if (this.isRightCurly()) {
                    if (this.mode == 7) {
                        this.mode = modestack.pop();
                    } else {
                        this.error_parsing(this.pos, 'unexpected "}"');
                    }
                } else if (this.isComma()) {
                    if ((expected & COMMA) === 0) {
                        this.error_parsing(this.pos, 'unexpected ","');
                    }
                    if (!!partial) {
                        break;
                    }
                    if (this.mode === 5 || this.mode === 6) {
                        this.tmpprio -= 10;
                    }
                    this.tmpprio += 2;
                    this.addfunc(tokenstack, operstack, TOP2);
                    this.tmpprio -= 2;
                    if (this.mode === 5 || this.mode === 6) {
                        this.tmpprio += 10;
                    }
                    noperators += 2;
                    expected = PRIMARY | LPAREN | LVARBRK | FUNCTION | SIGN | OPTION;
                } else if (this.isConst()) {
                    if ((expected & PRIMARY) === 0) {
                        this.error_parsing(this.pos, "unexpected constant");
                    }
                    var consttoken = new Token(TNUMBER, 0, 0, this.tokennumber);
                    tokenstack.push(consttoken);
                    expected = OPERATOR | RPAREN | RVARBRK | RBRACK | COMMA;
                } else {
                    var str = getStr(this.pos, this.expression, this.mode, partial, preprocessed);
                    if (this.isOpX(str, this.ops2) && (this.mode !== 2 && "/" !== str)) {
                        if ("and" === str.str || "or" === str.str) {
                            this.tokenprio = 3;
                        }
                        if ((expected & OPERATOR) === 0) {
                            this.error_parsing(this.pos, "unexpected binary operator");
                        }
                        this.addfunc(tokenstack, operstack, TOP2);
                        noperators += 2;
                        expected = PRIMARY | LPAREN | LVARBRK | FUNCTION | OPERATOR | SIGN | OPTION;
                    } else if (this.isOpX(str, this.ops1)) {
                        if ((expected & OPERATOR) === 0) {
                            this.error_parsing(this.pos, "unexpected unary operator");
                        }
                        this.addfunc(tokenstack, operstack, TOP1);
                        noperators++;
                        expected = PRIMARY | LPAREN | LVARBRK | FUNCTION;
                    } else if (this.isLiteralValue(str)) {
                        if ((expected & PRIMARY) === 0) {
                            this.error_parsing(this.pos, "unexpected literal value");
                        }
                        var token = new Token(TNUMBER, 0, 0, this.tokennumber);
                        tokenstack.push(token);
                        expected = FUNCTION | OPERATOR | RPAREN | RBRACK | RVARBRK | COMMA | LPAREN | RVARBRK | LBRACK | CALL | OPTION;
                        if (this.mode === 6) {
                            expected = expected | ASSIGN;
                        }
                    } else if (this.isVar(str)) {
                        if ((expected & PRIMARY) === 0) {
                            this.error_parsing(this.pos, "unexpected variable");
                        }
                        var vartoken = new Token(TVAR, this.tokenindex, 0, 0, this.mode, str.meta);
                        tokenstack.push(vartoken);
                        expected = FUNCTION | OPERATOR | RPAREN | RBRACK | RVARBRK | COMMA | LPAREN | RVARBRK | LBRACK | CALL | OPTION | ASSIGN;
                    } else {
                        if (this.errormsg === "") {
                            this.error_parsing(this.pos, "unknown character");
                        } else {
                            this.error_parsing(this.pos, this.errormsg);
                        }
                    }
                }
            }
            if (this.tmpprio < 0 || this.tmpprio >= 10) {
                this.error_parsing(this.pos, 'unmatched "() or []"');
            }
            while (operstack.length > 0) {
                var tmp = operstack.pop();
                tokenstack.push(tmp);
            }
            if (noperators + 1 !== tokenstack.length) {
                this.error_parsing(this.pos, "parity");
            }
            var res = new Expression(tokenstack, object(this.ops1), object(this.ops2), object(this.functions), this.precision, this.pos);
            return res;
        },
        evaluate: function(expr, element) {
            return this.parse(expr).evaluate(element);
        },
        error_parsing: function(column, msg) {
            this.success = false;
            this.errormsg = "parse error [column " + column + "]: " + msg;
            throw new Error(this.errormsg);
        },
        addfunc: function(tokenstack, operstack, type_) {
            var operator = new Token(type_, this.tokenindex, this.tokenprio + this.tmpprio, 0, this.mode, this.meta);
            while (operstack.length > 0) {
                if (operator.prio_ <= operstack[operstack.length - 1].prio_) {
                    tokenstack.push(operstack.pop());
                } else {
                    break;
                }
            }
            operstack.push(operator);
        },
        isNumber: function() {
            var r = false;
            var str = "";
            var prec = -1;
            while (this.pos < this.expression.length) {
                var code = this.expression.charCodeAt(this.pos);
                if (code >= 48 && code <= 57 || code === 46) {
                    str += this.expression.charAt(this.pos);
                    if (prec >= 0 || code === 46) {
                        prec++;
                    }
                    this.pos++;
                    r = true;
                } else {
                    break;
                }
            }
            if (r) {
                if (prec >= 0 && (typeof this.precision === "undefined" || prec > this.precision)) {
                    this.precision = prec;
                }
                this.tokennumber = parseFloat(str);
            }
            return r;
        },
        isConst: function() {
            var str;
            for (var i in this.consts) {
                if (true) {
                    var L = i.length;
                    str = this.expression.substr(this.pos, L);
                    if (i === str) {
                        this.tokennumber = this.consts[i];
                        this.pos += L;
                        return true;
                    }
                }
            }
            return false;
        },
        isOperator: function() {
            var ch = this.expression.charAt(this.pos);
            if (ch === "+") {
                this.tokenprio = 0;
                this.tokenindex = "+";
            } else if (ch === "-") {
                this.tokenprio = 0;
                this.tokenindex = "-";
            } else if (ch === "|") {
                if (this.expression.charAt(this.pos + 1) === "|") {
                    this.pos++;
                    this.tokenprio = 0;
                    this.tokenindex = "||";
                } else {
                    return false;
                }
            } else if (ch === "*") {
                if (this.expression.charAt(this.pos + 1) === "{") {
                    return false;
                }
                this.tokenprio = 1;
                this.tokenindex = "*";
            } else if (ch === "/" && this.mode != 2 && this.pos > 0) {
                this.tokenprio = 2;
                this.tokenindex = "/";
            } else if (ch === "%") {
                this.tokenprio = 2;
                this.tokenindex = "%";
            } else if (ch === "^") {
                this.tokenprio = 3;
                this.tokenindex = "^";
            } else if (ch === "=" || ch === "!") {
                if (this.expression.charAt(this.pos + 1) === "=") {
                    if (ch === "=") {
                        this.tokenindex = "==";
                    } else if (ch === "!") {
                        this.tokenindex = "!=";
                    } else {
                        return false;
                    }
                    this.pos++;
                    this.tokenprio = 6;
                } else if (ch === "!") {
                    this.tokenprio = 7;
                    this.tokenindex = "!";
                } else if (ch === "=") {
                    this.tokenindex = "=";
                } else {
                    return false;
                }
            } else if (ch === "<") {
                if (this.expression.charAt(this.pos + 1) === "=") {
                    this.tokenindex = "<=";
                    this.pos++;
                } else {
                    this.tokenindex = "<";
                }
                this.tokenprio = 4;
            } else if (ch === ">") {
                if (this.expression.charAt(this.pos + 1) === "=") {
                    this.tokenindex = ">=";
                    this.pos++;
                } else {
                    this.tokenindex = ">";
                }
                this.tokenprio = 4;
            } else if (ch === "." || ch === "[") {
                this.tokenprio = 10;
                this.tokenindex = ".";
            } else {
                return false;
            }
            this.pos++;
            return true;
        },
        isRightBracket: function() {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 93) {
                this.pos++;
                this.tmpprio -= 20;
                return true;
            }
            return false;
        },
        isSign: function() {
            var code = this.expression.charCodeAt(this.pos - 1);
            if (code === 45 || code === 43) {
                return true;
            }
            return false;
        },
        isAssign: function() {
            var code = this.expression.charCodeAt(this.pos - 1);
            if (code === 61) {
                var cha = this.expression.charAt(this.pos - 2);
                if (cha === "!" || cha === ">" || cha === "<" || cha === "=") {
                    return false;
                }
                cha = this.expression.charAt(this.pos);
                if (cha === ">" || cha === "<" || cha === "=") {
                    return false;
                }
                return true;
            }
            return false;
        },
        isPositiveSign: function() {
            var code = this.expression.charCodeAt(this.pos - 1);
            if (code === 43) {
                return true;
            }
            return false;
        },
        isNegativeSign: function() {
            var code = this.expression.charCodeAt(this.pos - 1);
            if (code === 45) {
                return true;
            }
            return false;
        },
        isLeftParenth: function() {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 40) {
                this.pos++;
                this.tmpprio += 10;
                return true;
            }
            return false;
        },
        isRightParenth: function() {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 41) {
                this.pos++;
                this.tmpprio -= 10;
                return true;
            }
            return false;
        },
        isLeftCurly: function() {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 123) {
                this.pos++;
                this.tmpprio += 10;
                return true;
            }
            return false;
        },
        isRightCurly: function() {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 125) {
                this.pos++;
                this.tmpprio -= 10;
                return true;
            }
            return false;
        },
        isComma: function() {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 44) {
                this.pos++;
                this.tokenprio = -1;
                this.tokenindex = ",";
                return true;
            }
            return false;
        },
        isWhite: function() {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 32 || code === 9 || code === 10 || code === 13) {
                this.pos++;
                return true;
            }
            return false;
        },
        isLeftVarBrk: function(modestack) {
            var pp = this.pos, ch = this.expression.charAt(pp);
            if (ch === "$" || ch === "@" || ch === "*" || ch === "#") {
                pp++;
                var ch2 = this.expression.charAt(pp);
                if (ch2 === "{") {
                    pp++;
                    this.tmpprio += 10;
                    this.tokenprio = -4;
                    var oldMode = this.mode;
                    modestack.push(oldMode);
                    if (ch === "$") {
                        this.mode = 1;
                    } else if (ch === "@") {
                        this.mode = 2;
                    } else if (ch === "*") {
                        this.mode = 3;
                    } else if (ch === "#") {
                        this.mode = 4;
                    }
                    this.tokenindex = "{";
                    this.pos = pp;
                    return true;
                }
            }
            return false;
        },
        isRightVarBrk: function() {
            var code = this.expression.charCodeAt(this.pos);
            if (code === 125) {
                this.pos++;
                this.tmpprio -= 10;
                return true;
            }
            return false;
        },
        isOpX: function(str, group) {
            if (str.str.length > 0) {
                if (str.str in new Object()) {
                    return false;
                }
                if (str.str in group) {
                    this.tokenindex = str.str;
                    this.tokenprio = 5;
                    this.pos = str.pos;
                    return true;
                }
            }
            return false;
        },
        isLiteralValue: function(str) {
            if (typeof str.str === "string") {
                var first = str.str.charAt(0);
                var last = str.str.charAt(str.str.length - 1);
                if (first == "'" && last == "'" || first == '"' && last == '"') {
                    this.tokennumber = str.str.substring(1, str.str.length - 1);
                    this.pos = str.pos;
                    return true;
                }
            }
            return false;
        },
        isVar: function(str) {
            if (str.str.length > 0) {
                this.tokenindex = str.str;
                this.tokenprio = 4;
                this.pos = str.pos;
                return true;
            }
            return false;
        },
        isComment: function() {
            var code = this.expression.charCodeAt(this.pos - 1);
            if (code === 47 && this.expression.charCodeAt(this.pos) === 42) {
                this.pos = this.expression.indexOf("*/", this.pos) + 2;
                if (this.pos === 1) {
                    this.pos = this.expression.length;
                }
                return true;
            }
            return false;
        }
    };
    return ThParser;
}();

(function() {
    const ELEMENT_NODE = 1;
    const TEXT_NODE = 3;
    var specAttrModList = [ "abbr", "accept", "accept-charset", "accesskey", "action", "align", "alt", "archive", "audio", "autocomplete", "axis", "background", "bgcolor", "border", "cellpadding", "cellspacing", "challenge", "charset", "cite", "class", "classid", "codebase", "codetype", "cols", "colspan", "compact", "content", "contenteditable", "contextmenu", "data", "datetime", "dir", "draggable", "dropzone", "enctype", "for", "form", "formaction", "formenctype", "formmethod", "formtarget", "frame", "frameborder", "headers", "height", "high", "href", "hreflang", "hspace", "http-equiv", "icon", "id", "keytype", "kind", "label", "lang", "list", "longdesc", "low", "manifest", "marginheight", "marginwidth", "max", "maxlength", "media", "method", "min", "name", "optimum", "pattern", "placeholder", "poster", "preload", "radiogroup", "rel", "rev", "rows", "rowspan", "rules", "sandbox", "scheme", "scope", "scrolling", "size", "sizes", "span", "spellcheck", "src", "srclang", "standby", "start", "step", "style", "summary", "tabindex", "target", "title", "type", "usemap", "value", "valuetype", "vspace", "width", "wrap", "xmlbase", "xmllang", "xmlspace" ];
    var fixedValBoolAttrList = [ "async", "autofocus", "autoplay", "checked", "controls", "declare", "default", "defer", "disabled", "formnovalidate", "hidden", "ismap", "loop", "multiple", "novalidate", "nowrap", "open", "pubdate", "readonly", "required", "reversed", "scoped", "seamless", "selected" ];
    var eventAttrList = [ "onabort", "onafterprint", "onbeforeprint", "onbeforeunload", "onblur", "oncanplay", "oncanplaythrough", "onchange", "onclick", "oncontextmenu", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave", "ondragover", "ondragstart", "ondrop", "ondurationchanged", "onemptied", "onended", "onerror", "onfocus", "onformchange", "onforminput", "onhashchange", "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata", "onloadstart", "onmessage", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onmousewheel", "onoffline", "ononline", "onpause", "onplay", "onplaying", "onpopstate", "onprogress", "onratechange", "onreadystatechange", "onredo", "onreset", "onresize", "onscroll", "onseeked", "onseeking", "onselect", "onshow", "onstalled", "onstorage", "onsubmit", "onsuspend", "ontimeupdate", "onundo", "onunload", "onvolumechange", "onwaiting" ];
    const literalTokenExpr = /^[a-zA-Z0-9\[\]\.\-_]*$/;
    const numericExpr = /^[+\-]?[0-9]*?[.]?[0-9]*?$/;
    const nonURLExpr = /[\$\*#]{1}\{(?:!?[^}]*)\}/;
    const varExpr = /[\$\*#@]{1}\{(!?[^}]*)\}/;
    const textInlineCommentExpr = /\[\[(.*)\]\]/;
    const javascriptInlineCommentExpr = /\/\*\[\[(.*)\]\]\*\//;
    const javascriptInlineRemainderExpr = /\s*(?:['][^']*['])*(?:["][^"]*["])*(?:[\(][^\(\)]*[\)])*(?:[\{][^\{\}]*[\}])*(?:[\[][^\[\]]*[\]])*((?:[;,\(\)\[\]:\{\}](?=(?:\s*\/\/.*?(?:\n|$)))(?:\s*\/\/.*?(?:\n|$)))|(?:\s*\/\/.*?(?:\n|$))|(?:[;,\(\)\[\]:\{\}](?=(?:\s*(?:\n|$)))(?:\s*(?:\n|$)))|(?:\s*(?:\n|$)))/;
    var thCase;
    thymol.getThAttribute = function(part, element) {
        var result = thymol.ThUtils.unParenthesise(part);
        result = thymol.doExpression(result, element);
        if (Object.prototype.toString.call(result) === "[object Array]") {
            if (result.length === 1) {
                result = result[0];
            }
        }
        if (result instanceof thymol.ThParam) {
            result = result.value;
        }
        return result;
    };
    thymol.doExpression = function(part, element) {
        var result = thymol.ThUtils.unParenthesise(part), expr, unq, token, mapped;
        expr = null;
        unq = thymol.ThUtils.unQuote(result);
        if (unq != result) {
            result = thymol.preProcess(unq, element);
        } else {
            if (literalTokenExpr.test(result)) {
                token = thymol.booleanAndNullTokens[result];
                if (!(typeof token === "undefined")) {
                    result = token;
                } else {
                    if (result.match(numericExpr)) {
                        result = thymol.ThUtils.getToPrecision(result, thymol.ThUtils.getDecimalDigits(result));
                    } else {
                        expr = thymol.getExpression(result, element);
                        if (expr !== undefined && expr !== null && !(expr != expr)) {
                            result = expr;
                        }
                    }
                }
            } else {
                expr = thymol.getExpression(result, element);
                if (expr !== null && !(expr != expr)) {
                    result = expr;
                } else {
                    result = null;
                }
            }
        }
        return result;
    };
    thymol.processText = function(element, thUrlAttr, thAttr) {
        var url = thymol.getThAttribute(thUrlAttr.value, element), updated = false, text, newTextNode, i, iLimit, iUpper;
        if (url == null) {
            if (!thymol.allowNullText) {
                thymol.error(false, "thymol.processText cannot process: " + thUrlAttr.name + '="' + thUrlAttr.value + '"\n' + element.innerHTML, element);
                return updated;
            }
            url = "";
        } else {
            if (url instanceof thymol.ThParam || url instanceof thymol.ThObject) {
                if (url.value) {
                    url = url.value;
                }
            } else if (url instanceof thymol.ThClass && url.abort) {
                element.removeAttribute(thUrlAttr.name);
                return true;
            }
        }
        try {
            while (element.firstChild != null) {
                element.removeChild(element.firstChild);
                updated = true;
                if (element.firstChild == null) {
                    break;
                }
            }
            if ("text" == thAttr.suffix) {
                if (Object.prototype.toString.call(url) === "[object Array]") {
                    text = "[";
                    for (i = 0, iLimit = url.length, iUpper = url.length - 1; i < iLimit; i++) {
                        text += url[i].toString();
                        if (i < iUpper) {
                            text += ", ";
                        }
                    }
                    text += "]";
                } else {
                    text = url.toString();
                }
                text = thymol.ThUtils.unescape(text);
                newTextNode = element.ownerDocument.createTextNode(text);
                element.appendChild(newTextNode);
                updated = true;
            }
            if ("utext" == thAttr.suffix) {
                element.innerHTML = url;
            }
            element.removeAttribute(thUrlAttr.name);
        } catch (err) {
            thymol.error(false, "text replace error", element, err);
        }
        return updated;
    };
    thymol.processSpecAttrMod = function(element, thUrlAttr, thAttrObj) {
        var url = thymol.getThAttribute(thUrlAttr.value, element);
        if (!url || !(url instanceof thymol.ThClass) || !url.abort) {
            element.setAttribute(thAttrObj.suffix, url);
        }
        element.removeAttribute(thUrlAttr.name);
    };
    thymol.processAttr = function(element, thUrlAttr, thAttrObj) {
        var argValue = thUrlAttr.value.trim(), argsExpr, expr, identifier, attrName = null, ep, lp, url, tt;
        if (argValue) {
            do {
                argsExpr = thymol.ThParser.parse(argValue, true, false);
                identifier = argsExpr.tokens.shift();
                if (identifier.type_ === 3) {
                    attrName = identifier.index_;
                    if (!!attrName) {
                        ep = argValue.indexOf("=");
                        if (ep >= 0) {
                            lp = argsExpr.position - 1;
                            if (argsExpr.position === argValue.length) {
                                lp = argValue.position;
                            }
                            expr = argValue.substring(ep + 1, lp).trim();
                            if (fixedValBoolAttrList.indexOf(attrName) >= 0) {
                                thymol.doFixedValBoolAttr(expr, element, attrName);
                            } else {
                                url = thymol.getThAttribute(expr, element);
                                tt = typeof url;
                                if (thAttrObj.suffix == "attrappend" || thAttrObj.suffix == "attrprepend") {
                                    if (url !== null && (tt === "number" || tt === "string" && url.length > 0)) {
                                        existing = element.getAttribute(attrName);
                                        if (existing) {
                                            if (thAttrObj.suffix == "attrappend") {
                                                url = existing + url;
                                            } else if (thAttrObj.suffix == "attrprepend") {
                                                url = url + existing;
                                            }
                                        }
                                    }
                                }
                                if (url !== null && (tt === "number" || tt === "string" && url.length > 0)) {
                                    element.setAttribute(attrName, url);
                                }
                            }
                        }
                    }
                    argValue = argValue.substring(argsExpr.position);
                } else {
                    break;
                }
            } while (argValue.length > 0);
        }
        element.removeAttribute(thUrlAttr.name);
    };
    thymol.processCSSAttr = function(element, thUrlAttr, thAttrObj) {
        var parts = thUrlAttr.value.split(","), i, iLimit, expr, attrName, url, tt, existing;
        for (i = 0, iLimit = parts.length; i < iLimit; i++) {
            expr = parts[i];
            attrName = thAttrObj.suffix == "classappend" ? "class" : "style";
            if (!!attrName) {
                if (!!expr) {
                    url = thymol.getThAttribute(expr, element);
                    tt = typeof url;
                    if (url !== null && (tt === "number" || tt === "string" && url.length > 0)) {
                        existing = element.getAttribute(attrName);
                        if (existing) {
                            url = existing + " " + url;
                        }
                    }
                    if (url !== null && (tt === "number" || tt === "string" && url.length > 0)) {
                        element.setAttribute(attrName, url);
                    }
                }
            }
        }
        element.removeAttribute(thUrlAttr.name);
    };
    thymol.processFixedValBoolAttr = function(element, thUrlAttr, thAttrObj) {
        var val = thymol.doFixedValBoolAttr(thUrlAttr.value, element, thAttrObj.suffix);
        if (val != null) {
            element.removeAttribute(thUrlAttr.name);
        } else {
            thymol.error(false, "processFixedValBoolAttr cannot process: " + thUrlAttr.name + '="' + thUrlAttr.value + '"\n' + element.innerHTML, element);
        }
    };
    thymol.doFixedValBoolAttr = function(valParam, element, attr) {
        var val = thymol.getBoolean(valParam, element);
        if (val) {
            element.setAttribute(attr, attr);
        }
        return val;
    };
    thymol.processPairedAttr = function(element, thUrlAttr, thAttrObj) {
        var url = thymol.getThAttribute(thUrlAttr.value, element);
        if (url != "") {
            if (thAttrObj.suffix === "alt-title") {
                element.setAttribute("alt", url);
                element.setAttribute("title", url);
            }
            if (thAttrObj.suffix === "lang-xmllang") {
                element.setAttribute("lang", url);
                element.setAttribute("xml:lang", url);
            }
            element.removeAttribute(thUrlAttr.name);
        } else {
            thymol.error(false, "processPairedAttr cannot process: " + thUrlAttr.name + '="' + thUrlAttr.value + '"\n' + element.innerHTML, element);
        }
    };
    thymol.processConditional = function(element, attr, thAttrObj) {
        var removed = false;
        if (attr.value) {
            removed = thymol.doIfOrUnless(element, attr.value, thAttrObj.suffix === "if");
        }
        element.removeAttribute(attr.name);
        return removed;
    };
    thymol.doIfOrUnless = function(element, value, isIf) {
        var processed = false, flag;
        if (value) {
            flag = thymol.getBoolean(value, element);
            processed = true;
            if (!flag) {
                if (isIf) {
                    element.parentNode.removeChild(element);
                    return true;
                }
            } else {
                if (!isIf) {
                    element.parentNode.removeChild(element);
                    return true;
                }
            }
        }
        if (!processed) {
            thymol.error(false, "processConditional cannot process conditional: " + value + "\n" + element.innerHTML, element);
        }
        return false;
    };
    thymol.processEach = function(element, thUrlAttr, junk) {
        var elementsUpdated = false, initial = thUrlAttr.value.trim(), colonPos, varName, varNames, statVarName, expr, root, node, i, iLimit, tho, stat, count, newNode, next;
        colonPos = initial.indexOf(":");
        if (colonPos > 0) {
            varName = initial.substring(0, colonPos);
            if (varName) {
                varName = varName.trim();
                varNames = varName.split(",");
                varName = varNames[0].trim();
                if (varNames.length > 1) {
                    statVarName = varNames[1].trim();
                } else {
                    statVarName = varName + "Stat";
                }
                expr = initial.substr(colonPos + 1);
                if (expr) {
                    expr = expr.trim();
                    expr = thymol.getExpression(expr, element);
                    if (expr instanceof thymol.ThSet) {
                        expr = expr.toArray();
                    }
                    root = element.parentNode;
                    if (expr && expr instanceof Object && expr.length > 0) {
                        node = element;
                        iLimit = expr.length;
                        element.removeAttribute(thUrlAttr.name);
                        for (i = 0; i < iLimit; i++) {
                            tho = expr[i];
                            stat = new Object();
                            stat.current = tho;
                            stat.size = expr.length;
                            stat.index = i;
                            count = i + 1;
                            stat.count = count;
                            if (i == 0) {
                                stat.first = true;
                            } else {
                                stat.first = false;
                            }
                            if (i == expr.length - 1) {
                                stat.last = true;
                            } else {
                                stat.last = false;
                            }
                            if (i % 2) {
                                stat.odd = true;
                                stat.even = false;
                            } else {
                                stat.odd = false;
                                stat.even = true;
                            }
                            if (!node.thLocalVars) {
                                node.thLocalVars = {};
                            }
                            node.thLocalVars[varName] = tho;
                            node.thLocalVars[statVarName] = stat;
                            if (count < expr.length) {
                                newNode = element.cloneNode(true);
                                if (node.nextSibling != null) {
                                    next = root.insertBefore(newNode, node.nextSibling);
                                } else {
                                    next = root.appendChild(newNode);
                                }
                                node = next;
                                elementsUpdated = true;
                            }
                        }
                    } else {
                        if (root !== null) {
                            if (!element.thLocalVars) {
                                element.thLocalVars = {};
                            }
                            if (!element.thLocalVars[varName]) {
                                element.thLocalVars[varName] = new Object();
                            }
                            if (!element.thLocalVars[statVarName]) {
                                element.thLocalVars[statVarName] = new Object();
                            }
                            root.removeChild(element);
                            elementsUpdated = true;
                        }
                    }
                }
            }
        }
        return elementsUpdated;
    };
    thymol.processObject = function(element, thUrlAttr) {
        var argValue = thUrlAttr.value.trim(), val;
        if (argValue) {
            val = thymol.getExpression(argValue, element);
            if (val) {
                element.thObjectVar = val;
            }
        }
        element.removeAttribute(thUrlAttr.name);
    };
    thymol.processInline = function(element, thUrlAttr, thAttrObj) {
        var mode = thymol.getThAttribute(thUrlAttr.value, element);
        if (mode == "text") {
            thymol.doInlineText(element);
        } else if (mode == "javascript" || mode == "dart") {
            thymol.doInlineJavascript(element);
        } else {
            thymol.error(false, 'processInline cannot process scripting mode: "' + mode + '" - it isn\'t supported by version "' + thymol.thVersion + '"', element);
        }
        element.removeAttribute(thUrlAttr.name);
    };
    thymol.doInlineText = function(element) {
        var changed, value, i, iLimit, expr, term, result;
        for (i = 0, iLimit = element.childNodes.length; i < iLimit; i++) {
            do {
                changed = false;
                if (element.childNodes[i].nodeType === ELEMENT_NODE) {
                    thymol.doInlineText(element.childNodes[i]);
                } else if (element.childNodes[i].nodeType === TEXT_NODE) {
                    value = element.childNodes[i].nodeValue;
                    if (value) {
                        expr = textInlineCommentExpr.exec(value);
                        if (expr) {
                            term = "";
                            if (expr.length > 1) {
                                term = "[[" + expr[1] + "]]";
                            }
                            if (expr.length > 1) {
                                result = thymol.getThAttribute(expr[1], element);
                                result = value.replace(term, result);
                                element.childNodes[i].nodeValue = result;
                                changed = true;
                            }
                            expr = null;
                        }
                    }
                }
            } while (changed);
        }
    };
    thymol.doInlineJavascript = function(element) {
        var changed, value, second, i, iLimit, expr, scraps, remainder, termIndx, term, secondIndx, result;
        for (i = 0, iLimit = element.childNodes.length; i < iLimit; i++) {
            do {
                second = null;
                changed = false;
                value = element.childNodes[i].nodeValue;
                if (value) {
                    expr = javascriptInlineCommentExpr.exec(value);
                    if (expr) {
                        termIndx = expr.index;
                        term = "";
                        if (expr.length > 1) {
                            term = "/*[[" + expr[1] + "]]*/";
                        }
                        termIndx = termIndx + term.length;
                        remainder = value.substring(termIndx);
                        scraps = javascriptInlineRemainderExpr.exec(remainder);
                        if (scraps) {
                            if (scraps.length > 1) {
                                secondIndx = remainder.indexOf(scraps[1]);
                                second = remainder.substring(secondIndx);
                                value = value.substring(0, termIndx);
                                value = value + second;
                            }
                        }
                        if (expr.length > 1) {
                            result = thymol.getExpression(expr[1], element);
                            if (result instanceof thymol.ThObject) {
                                result = result.toNonThObject();
                            }
                            if (!thymol.ThUtils.isLiteral(result)) {
                                result = thymol.getStringView(result);
                            }
                            result = value.replace(term, result);
                            element.childNodes[i].nodeValue = result;
                            changed = true;
                        }
                        expr = null;
                        scraps = null;
                    }
                }
            } while (changed);
        }
    };
    thymol.getStringView = function(param) {
        var view = "", objType;
        if (typeof param === "string") {
            view = view + thymol.inlineQuote + param + thymol.inlineQuote;
        } else if (typeof param === "number" || typeof param === "boolean") {
            view = view + param;
        } else if (typeof param === "object") {
            if (param instanceof Object) {
                objType = Object.prototype.toString.call(param);
                if ("[object Array]" == objType) {
                    view = thymol.getStringViewArray(param);
                } else if ("[object Object]" == objType) {
                    view = thymol.getStringViewObject(param);
                }
            }
        }
        return view;
    };
    thymol.getStringViewArray = function(param) {
        var view = "[", i, iLimit;
        for (i = 0, iLimit = param.length; i < iLimit; i++) {
            view = view + thymol.getStringView(param[i]);
            if (i < param.length - 1) {
                view = view + ",";
            }
        }
        view = view + "]";
        return view;
    };
    thymol.getStringViewObject = function(param) {
        var view = "{", key = null;
        for (key in param) {
            if (key) {
                if (view != "{") {
                    view = view + ",";
                }
                view = view + thymol.getStringView(key) + ":";
                view = view + thymol.getStringView(param[key]);
            }
        }
        view = view + "}";
        return view;
    };
    thymol.processRemove = function(element, thUrlAttr) {
        var locals = element.thLocalVars, savedLocals = element.thLocalVars, arg, children, first, haveRemoved = false;
        if (!locals) {
            locals = {};
        }
        if (!locals["tag"]) {
            locals["tag"] = "tag";
        }
        if (!locals["body"]) {
            locals["body"] = "body";
        }
        if (!locals["none"]) {
            locals["none"] = "none";
        }
        if (!locals["all"]) {
            locals["all"] = "all";
        }
        if (!locals["all-but-first"]) {
            locals["all-but-first"] = "all-but-first";
        }
        element.thLocalVars = locals;
        arg = thymol.getThAttribute(thUrlAttr.value, element);
        element.thLocalVars = savedLocals;
        element.removeAttribute(thUrlAttr.name);
        if ("all" == arg) {
            if (element.parentNode != null) {
                element.parentNode.removeChild(element);
                haveRemoved = true;
            }
        } else if ("body" == arg) {
            element.innerHTML = "";
            haveRemoved = true;
        } else if ("tag" == arg) {
            thymol.ThUtils.removeTag(element);
            haveRemoved = true;
        } else if ("all-but-first" == arg) {
            if (element.hasChildNodes()) {
                nodes = element.childNodes;
                var kids = new Array();
                first = true;
                for (var i = 0, iLimit = nodes.length; i < iLimit; i++) {
                    if (nodes[i].nodeType === ELEMENT_NODE) {
                        if (!first) {
                            kids.push(nodes[i]);
                        }
                        first = false;
                    }
                }
                for (var i = 0, iLimit = kids.length; i < iLimit; i++) {
                    element.removeChild(kids[i]);
                    haveRemoved = true;
                }
            }
        }
        return haveRemoved;
    };
    thymol.processSwitch = function(element, attr) {
        var val = thymol.ThUtils.unParenthesise(attr.value), updated = false, args, matched = false, thCaseSpecs, caseClause, remove, ccAttr;
        val = thymol.getThAttribute(val, element);
        if (typeof val === "string") {
            args = val.match(nonURLExpr);
            if (args) {
                val = args[1];
            }
        }
        val = thymol.ThUtils.unQuote(val);
        thCaseSpecs = element.querySelectorAll(thCase.escpName + "," + thCase.escpSynonym);
        for (i = 0, iLimit = thCaseSpecs.length; i < iLimit; i++) {
            remove = true;
            for (j = 0, jLimit = thCaseSpecs[i].attributes.length; j < jLimit; j++) {
                ccAttr = thCaseSpecs[i].attributes.item(j);
                if (!!ccAttr) {
                    if (thCase.name == ccAttr.name || thCase.synonym == ccAttr.name) {
                        if (!matched) {
                            matched = thymol.processCase(element, ccAttr, val);
                            if (matched) {
                                remove = false;
                            }
                        }
                        thCaseSpecs[i].removeAttribute(ccAttr.name);
                    }
                }
            }
            if (remove) {
                element.removeChild(thCaseSpecs[i]);
                updated = true;
            }
        }
        element.removeAttribute(attr.name);
        return updated;
    };
    thymol.processCase = function(element, attr, param) {
        if (attr.value != "*") {
            var val = thymol.getExpression(attr.value, element);
            val = thymol.ThUtils.unQuote(val);
            if (param && param == val) {
                return true;
            }
            return false;
        }
        return true;
    };
    thymol.processWith = function(element, thUrlAttr) {
        thymol.getWith(element, thUrlAttr.value);
        element.removeAttribute(thUrlAttr.name);
    };
    thymol.processAssert = function(element, thUrlAttr) {
        var argValue = thUrlAttr.value.trim(), result = true, term = "", terms, i, iLimit, expr, val, flag;
        if (argValue) {
            terms = argValue.split(",");
            for (i = 0, iLimit = terms.length; i < iLimit; i++) {
                term = terms[i];
                expr = thymol.ThUtils.unParenthesise(term);
                if (expr != null) {
                    val = thymol.getExpression(expr, element);
                    if (val) {
                        flag = thymol.getBoolean(val, element);
                        if (!flag) {
                            result = false;
                            break;
                        }
                    } else {
                        result = false;
                        break;
                    }
                } else {
                    result = false;
                    break;
                }
            }
        }
        if (!result) {
            if (argValue != term) {
                argValue = " list is: " + argValue;
            } else {
                argValue = "";
            }
            if (term != "") {
                term = ' false term is: "' + term + '"';
            }
            thymol.error(false, "processAssert assertion failure -" + argValue + term, element);
        }
        element.removeAttribute(thUrlAttr.name);
    };
    thymol.getBoolean = function(param, element) {
        if (param == null) {
            return false;
        }
        if (typeof param === "boolean") {
            return param;
        } else if (typeof param === "number") {
            return param != 0;
        }
        var initial = thymol.ThUtils.unParenthesise(param), negate = false, val, args, flag;
        if (initial.charAt(0) == "!") {
            negate = true;
            initial = initial.substring(1, initial.length);
            initial = thymol.ThUtils.unParenthesise(initial);
        }
        val = thymol.getThAttribute(initial, element);
        if (val == null) {
            args = initial.match(varExpr);
            if (args) {
                if (args[1].charAt(0) == "!") {
                    negate = !negate;
                }
            }
        }
        flag = thymol.getBooleanValue(val);
        if (negate) {
            flag = !flag;
        }
        return flag;
    };
    thymol.appendToAttrList = function(func, prec, attrArray) {
        var j, jLimit = attrArray.length, tha = null;
        for (j = 0; j < jLimit; j++) {
            tha = new thymol.ThAttr(attrArray[j], func, prec, thymol.thThymeleafPrefixList, thymol.prefix);
        }
        j = tha;
    };
    thymol.setupAttrList = function() {
        thCase = new thymol.ThAttr("case", null, 275, thymol.thThymeleafPrefixList, thymol.prefix);
        thymol.addDialect({
            prefix: thymol.prefix,
            attributeProcessors: [ {
                name: "each",
                processor: thymol.processEach,
                precedence: 200
            }, {
                name: "switch",
                processor: thymol.processSwitch,
                precedence: 250
            }, {
                name: "if",
                processor: thymol.processConditional,
                precedence: 300
            }, {
                name: "unless",
                processor: thymol.processConditional,
                precedence: 400
            }, {
                name: "object",
                processor: thymol.processObject,
                precedence: 500
            }, {
                name: "with",
                processor: thymol.processWith,
                precedence: 600
            }, {
                name: "attr",
                processor: thymol.processAttr,
                precedence: 700
            }, {
                name: "attrprepend",
                processor: thymol.processAttr,
                precedence: 800
            }, {
                name: "attrappend",
                processor: thymol.processAttr,
                precedence: 900
            }, {
                name: "alt-title",
                processor: thymol.processPairedAttr,
                precedence: 990
            }, {
                name: "lang-xmllang",
                processor: thymol.processPairedAttr,
                precedence: 990
            }, {
                name: "inline",
                processor: thymol.processInline,
                precedence: 1e3
            }, {
                name: "classappend",
                processor: thymol.processCSSAttr,
                precedence: 1100
            }, {
                name: "styleappend",
                processor: thymol.processCSSAttr,
                precedence: 1100
            }, {
                name: "text",
                processor: thymol.processText,
                precedence: 1300
            }, {
                name: "utext",
                processor: thymol.processText,
                precedence: 1400
            }, {
                name: "assert",
                processor: thymol.processAssert,
                precedence: 1550
            }, {
                name: "remove",
                processor: thymol.processRemove,
                precedence: 1600
            } ]
        });
        thymol.appendToAttrList(thymol.processSpecAttrMod, 1e3, specAttrModList);
        thymol.appendToAttrList(thymol.processSpecAttrMod, 1e3, eventAttrList);
        thymol.appendToAttrList(thymol.processFixedValBoolAttr, 1e3, fixedValBoolAttrList);
    };
})();

thymol.objects.thHttpSessionObject = function() {
    var thExpressionObjectName = "#httpSession";
    function getAttribute(name) {
        var result = thymol.sessionContext[name];
        return result;
    }
    function getParameter(name) {
        var result = thymol.sessionContext[name];
        return result;
    }
    function getServletContext() {
        var result = thymol.applicationContext;
        return result;
    }
    function getSessionContext() {
        var result = thymol.sessionContext;
        return result;
    }
    function getContextPath() {
        var result = "";
        return result;
    }
    function getRequestName() {
        var result = "";
        return result;
    }
    function getParameterValues(name) {
        var result = thymol.sessionContext[name];
        return result;
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        getAttribute: getAttribute,
        getParameter: getParameter,
        getServletContext: getServletContext,
        getSessionContext: getSessionContext,
        getContextPath: getContextPath,
        getRequestName: getRequestName,
        getParameterValues: getParameterValues
    };
}();

thymol.objects.thHttpServletRequestObject = function() {
    var thExpressionObjectName = "#httpServletRequest";
    function getAttribute(name) {
        var result = thymol.requestContext[name][0];
        if (result instanceof thymol.ThParam) {
            result = thymol.ThUtils.unQuote(result.value);
        }
        return result;
    }
    function getParameter(name) {
        var result = thymol.requestContext[name];
        return result;
    }
    function getContextPath() {
        var result = "";
        return result;
    }
    function getRequestName() {
        var result = "";
        return result;
    }
    function getParameterValues(name) {
        var result = thymol.requestContext[name];
        return result;
    }
    function getSession(create) {
        return thymol.objects.thHttpSessionObject;
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        getAttribute: getAttribute,
        getParameter: getParameter,
        getContextPath: getContextPath,
        getRequestName: getRequestName,
        getParameterValues: getParameterValues,
        getSession: getSession
    };
}();

thymol.objects.thAggregatesObject = function() {
    var thExpressionObjectName = "#aggregates";
    function sum(target) {
        return aggregate(target, false, "sum");
    }
    function avg(target) {
        return aggregate(target, true, "avg");
    }
    function aggregate(target, doAvg, label) {
        if (target !== null) {
            var result = 0;
            var count;
            var tt = typeof target;
            var ptc = Object.prototype.toString.call(target);
            if (tt === "Array" || ptc === "[object Array]") {
                count = target.length;
                for (var i = 0; i < count; i++) {
                    if (target[i] !== null) {
                        result += target[i];
                    } else {
                        aggregatesError("Cannot aggregate on object containing nulls", this);
                    }
                }
            } else {
                count = 0;
                for (var k in target) {
                    var value = target[k];
                    var process = false;
                    if (value !== null) {
                        if (target instanceof thymol.ThSet) {
                            process = target.isContent(k);
                        } else {
                            process = target.hasOwnProperty(k) && typeof value !== "function";
                        }
                    } else {
                        aggregatesError("Cannot aggregate on object containing nulls", this);
                    }
                    if (process) {
                        result += value;
                        count++;
                    }
                }
            }
            if (doAvg) {
                if (count == 0) {
                    aggregatesError("Cannot get size of object", this);
                }
                result = result / count;
            }
            return result;
        }
        aggregatesError("Cannot aggregate on null", this);
    }
    function aggregatesError(text, element) {
        thymol.error(true, "#aggregates." + " " + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        sum: sum,
        avg: avg
    };
}();

thymol.objects.thArraysObject = function() {
    var thExpressionObjectName = "#arrays";
    function toArray(target) {
        if (target !== null) {
            return toTypedArray(null, target);
        }
        arraysError("toArray Cannot convert null to array", this);
    }
    function toStringArray(target) {
        if (target !== null) {
            return toTypedArray("string", target);
        }
        arraysError("toStringArray Cannot convert null to array", this);
    }
    function toNumberArray(target) {
        if (target !== null) {
            return toTypedArray("number", target);
        }
        arraysError("toNumberArray Cannot convert null to array", this);
    }
    function toBooleanArray(target) {
        if (target !== null) {
            return toTypedArray("boolean", target);
        }
        arraysError("toBooleanArray Cannot convert null to array", this);
    }
    function toTypedArray(componentClass, target) {
        if (target instanceof Array) {
            if (componentClass === null || componentClass === "undefined") {
                return target;
            }
            var result = new Array();
            try {
                for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                    if (target[i] !== null) {
                        if (componentClass === "string") {
                            result.push(new String(target[i]).valueOf());
                        } else if (componentClass === "number") {
                            result.push(new Number(target[i]).valueOf());
                        } else if (componentClass === "boolean") {
                            result.push(new Boolean(target[i]).valueOf());
                        } else {
                            result.push(target[i]);
                        }
                    }
                }
            } catch (err) {
                arraysError('toArray Cannot convert object of class "' + targetComponentClass.getName() + '[]" to an array' + " of " + componentClass.getClass().getSimpleName());
            }
            return result;
        } else if (target instanceof Object) {
            var result = new Array();
            try {
                for (var k in target) {
                    var value = target[k];
                    var process = false;
                    if (value !== null) {
                        if (target instanceof thymol.ThSet) {
                            process = target.isContent(k);
                        } else {
                            process = target.hasOwnProperty(k) && typeof value !== "function";
                        }
                    }
                    if (process) {
                        if (componentClass === "string") {
                            result.push(new String(value).valueOf());
                        } else if (componentClass === "number") {
                            result.push(new Number(value).valueOf());
                        } else if (componentClass === "boolean") {
                            result.push(new Boolean(value).valueOf());
                        } else {
                            result.push(value);
                        }
                    }
                }
            } catch (err) {
                arraysError('toArray Cannot convert object of class "' + targetComponentClass.getName() + '[]" to an array' + " of " + componentClass.getClass().getSimpleName());
            }
            return result;
        } else {
            arraysError('toArray Cannot convert object of type "' + typeof target + '" to an array' + (componentClass == null ? "" : " of " + componentClass));
        }
    }
    function length(target) {
        if (target !== null) {
            return target.length;
        }
        arraysError("length Cannot get array length of null", this);
    }
    function isEmpty(target) {
        return target === null || target.length <= 0;
    }
    function contains(target, element) {
        if (target !== null) {
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] === null) {
                    if (element === null) {
                        return true;
                    }
                } else if (element !== null && target[i] === element) {
                    return true;
                }
            }
            return false;
        }
        arraysError("contains Cannot execute array contains: target is null", this);
    }
    function containsAll(target, elements) {
        if (target !== null) {
            if (elements !== null) {
                var elementsArray;
                if (elements instanceof Array) {
                    elementsArray = [].concat(elements);
                } else {
                    if (elements instanceof thymol.ThSet) {
                        elementsArray = elements.toArray();
                    } else {
                        elementsArray = [];
                        for (var k in elements) {
                            if (elements.hasOwnProperty(k) && typeof elements[k] !== "function") {
                                elementsArray.push(elements[k]);
                            }
                        }
                    }
                }
                for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                    for (var j = 0, jLimit = elementsArray.length; j < jLimit; j++) {
                        if (target[i] === elementsArray[j]) {
                            elementsArray.splice(j, 1);
                        }
                    }
                }
                return elementsArray.length === 0;
            }
            arraysError("containsAll Cannot execute array containsAll: elements is null", this);
        }
        arraysError("containsAll Cannot execute array containsAll: target is null", this);
    }
    function arraysError(text, element) {
        thymol.error(true, "#arrays." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        toArray: toArray,
        toStringArray: toStringArray,
        toIntegerArray: toNumberArray,
        toLongArray: toNumberArray,
        toDoubleArray: toNumberArray,
        toFloatArray: toNumberArray,
        toBooleanArray: toBooleanArray,
        length: length,
        isEmpty: isEmpty,
        contains: contains,
        containsAll: containsAll
    };
}();

thymol.objects.thBoolsObject = function() {
    var thExpressionObjectName = "#bools";
    function isTrue(target) {
        var result = true;
        var tc;
        if (target == null || (tc = typeof target) === "undefined") {
            result = false;
        } else {
            if (tc === "boolean") {
                result = target;
            } else if (tc === "number") {
                result = target != 0;
            } else if (tc === "string") {
                if (target.length === 1) {
                    result = target.charCodeAt(0) != 0;
                } else if (thymol.ThUtils.testLiteralFalse(target)) {
                    result = false;
                }
            }
        }
        return result;
    }
    function arrayIsTrue(target) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(isTrue(target[i]));
            }
            return result;
        }
        boolsError("arrayIsTrue Target cannot be null", this);
    }
    function setIsTrue(target) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(isTrue(target[k]));
                }
            }
            return result;
        }
        boolsError("setIsTrue Target cannot be null", this);
    }
    function isFalse(target) {
        return !isTrue(target);
    }
    function arrayIsFalse(target) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(!isTrue(target[i]));
            }
            return result;
        }
        boolsError("arrayIsFalse Target cannot be null", this);
    }
    function setIsFalse(target) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(!isTrue(target[k]));
                }
            }
            return result;
        }
        boolsError("setIsFalse Target cannot be null", this);
    }
    function arrayAnd(target) {
        if (target !== null) {
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (!isTrue(target[i])) {
                    return false;
                }
            }
            return true;
        }
        boolsError("arrayAnd Target cannot be null", this);
    }
    function setAnd(target) {
        if (target !== null) {
            for (var k in target) {
                if (target.isContent(k)) {
                    if (!isTrue(target[k])) {
                        return false;
                    }
                }
            }
            return true;
        }
        boolsError("setAnd Target cannot be null", this);
    }
    function arrayOr(target) {
        if (target !== null) {
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (isTrue(target[i])) {
                    return true;
                }
            }
            return false;
        }
        boolsError("arrayOr Target cannot be null", this);
    }
    function setOr(target) {
        if (target !== null) {
            for (var k in target) {
                if (target.isContent(k)) {
                    if (isTrue(target[k])) {
                        return true;
                    }
                }
            }
            return false;
        }
        boolsError("setOr Target cannot be null", this);
    }
    function boolsError(text, element) {
        thymol.error(true, "#bools." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        isTrue: isTrue,
        arrayIsTrue: arrayIsTrue,
        listIsTrue: arrayIsTrue,
        setIsTrue: setIsTrue,
        isFalse: isFalse,
        arrayIsFalse: arrayIsFalse,
        listIsFalse: arrayIsFalse,
        setIsFalse: setIsFalse,
        arrayAnd: arrayAnd,
        listAnd: arrayAnd,
        setAnd: setAnd,
        arrayOr: arrayOr,
        listOr: arrayOr,
        setOr: setOr
    };
}();

thymol.objects.thDatesObject = function() {
    var thExpressionObjectName = "#dates";
    function createProxy() {
        if (arguments !== null) {
            if (arguments.length > 6) {
                return create(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
            } else if (arguments.length > 5) {
                return create(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], 0);
            } else if (arguments.length > 4) {
                return create(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], 0, 0);
            }
            return create(arguments[0], arguments[1], arguments[2], 0, 0, 0, 0);
        }
    }
    function create(year, month, day, hour, minute, second, millisecond) {
        var result = new Date();
        result.setMilliseconds(millisecond);
        result.setSeconds(second);
        result.setMinutes(minute);
        result.setHours(hour);
        result.setDate(day);
        result.setMonth(month - 1);
        result.setFullYear(year);
        return result;
    }
    function getDay(dateValue) {
        var month = dateValue.getMonth() + 1;
        var year = dateValue.getFullYear();
        var day = dateValue.getDate();
        var a = Math.floor((14 - month) / 12);
        var y = year + 4800 - a;
        var m = month + 12 * a - 3;
        var jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4);
        if (jdn < 2331254) {
            jdn = jdn - 32083;
        } else {
            jdn = jdn - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        }
        var mjdn = (jdn + 1) % 7;
        return mjdn;
    }
    function createNow() {
        return new Date();
    }
    function createToday() {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }
    function format(dateParam, patternParam, locale) {
        var pattern = "";
        var date;
        if (arguments === null) {
            date = new Date();
        } else {
            if (arguments.length > 1) {
                pattern = patternParam;
            }
            date = dateParam;
        }
        return formatDate(date, pattern, locale);
    }
    function formatDate(target, patternParam, locale) {
        var pattern = "";
        if (arguments.length > 1) {
            pattern = patternParam;
        }
        var result = dateFormat(target, pattern, false);
        return result;
    }
    function arrayFormat(target, patternParam) {
        var pattern = "";
        if (arguments.length > 1) {
            pattern = patternParam;
        }
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(dateFormat(target[i], pattern, false));
        }
        return result;
    }
    function setFormat(target, patternParam) {
        var pattern = "";
        if (arguments.length > 1) {
            pattern = patternParam;
        }
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(dateFormat(target[k], pattern, false));
            }
        }
        return result;
    }
    function day(target) {
        return target.getDate();
    }
    function arrayDay(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(target[i].getDate());
        }
        return result;
    }
    function setDay(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(target[k].getDate());
            }
        }
        return result;
    }
    function month(target) {
        return target.getMonth() + 1;
    }
    function arrayMonth(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(target[i].getMonth() + 1);
        }
        return result;
    }
    function setMonth(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(target[k].getMonth() + 1);
            }
        }
        return result;
    }
    function monthName(target) {
        return dateFormat.i18n.monthNames[target.getMonth() + 12];
    }
    function arrayMonthName(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(dateFormat.i18n.monthNames[target[i].getMonth() + 12]);
        }
        return result;
    }
    function setMonthName(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(dateFormat.i18n.monthNames[target[k].getMonth() + 12]);
            }
        }
        return result;
    }
    function monthNameShort(target) {
        return dateFormat.i18n.monthNames[target.getMonth()];
    }
    function arrayMonthNameShort(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(dateFormat.i18n.monthNames[target[i].getMonth()]);
        }
        return result;
    }
    function setMonthNameShort(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(dateFormat.i18n.monthNames[target[k].getMonth()]);
            }
        }
        return result;
    }
    function year(target) {
        return target.getFullYear();
    }
    function arrayYear(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(target[i].getFullYear());
        }
        return result;
    }
    function setYear(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(target[k].getFullYear());
            }
        }
        return result;
    }
    function dayOfWeek(target) {
        return getDay(target) + 1;
    }
    function arrayDayOfWeek(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(getDay(target[i]) + 1);
        }
        return result;
    }
    function setDayOfWeek(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(getDay(target[k]) + 1);
            }
        }
        return result;
    }
    function dayOfWeekName(target) {
        return dateFormat.i18n.dayNames[getDay(target) + 7];
    }
    function arrayDayOfWeekName(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(dateFormat.i18n.dayNames[getDay(target[i]) + 7]);
        }
        return result;
    }
    function setDayOfWeekName(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(dateFormat.i18n.dayNames[getDay(target[k]) + 7]);
            }
        }
        return result;
    }
    function dayOfWeekNameShort(target) {
        return dateFormat.i18n.dayNames[getDay(target)];
    }
    function arrayDayOfWeekNameShort(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(dateFormat.i18n.dayNames[getDay(target[i])]);
        }
        return result;
    }
    function setDayOfWeekNameShort(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(dateFormat.i18n.dayNames[getDay(target[k])]);
            }
        }
        return result;
    }
    function hour(target) {
        return target.getHours();
    }
    function arrayHour(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(target[i].getHours());
        }
        return result;
    }
    function setHour(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(target[k].getHours());
            }
        }
        return result;
    }
    function minute(target) {
        return target.getMinutes();
    }
    function arrayMinute(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(target[i].getMinutes());
        }
        return result;
    }
    function setMinute(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(target[k].getMinutes());
            }
        }
        return result;
    }
    function second(target) {
        return target.getSeconds();
    }
    function arraySecond(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(target[i].getSeconds());
        }
        return result;
    }
    function setSecond(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(target[k].getSeconds());
            }
        }
        return result;
    }
    function millisecond(target) {
        return target.getMilliseconds();
    }
    function arrayMillisecond(target) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(target[i].getMilliseconds());
        }
        return result;
    }
    function setMillisecond(target) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.isContent(k)) {
                result.add(target[k].getMilliseconds());
            }
        }
        return result;
    }
    var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, timezoneClip = /[^-+\dA-Z]/g;
    function processTZ(target) {
        var toStr = String(target);
        var result = toStr;
        result = (result.match(timezone) || [ "" ]).pop();
        if ("" !== result) {
            result = result.replace(timezoneClip, "");
            var tail = toStr.match(/[\(]((?:[GL]M|BS)T[^\)]*?)[\)]/);
            if (tail) {
                if (target.getFullYear() > 1916 || target.getFullYear() === 1916 && target.getMonth() > 4 || target.getFullYear() === 1916 && target.getMonth() === 4 && target.getDate() > 20) {
                    result = result.replace(/GMT\+\d{1,4}/, "BST");
                } else {
                    result = result.replace(/GMT\+\d{1,4}/, "GMT");
                }
            }
        }
        return result;
    }
    var dateFormat = function() {
        var token = /d{1,4}|M{1,4}|yy(?:yy)?|([HhmsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g, pad = function(valp, lenp) {
            var val = String(valp), len = lenp || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };
        return function(datep, maskp, utcp) {
            var dF = dateFormat, mask = maskp, date = datep, utc = utcp;
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) throw SyntaxError("invalid date");
            mask = String(dF.masks[mask] || mask || dF.masks["default"]);
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
            var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = getDay(date), M = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), m = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
                d: d,
                dd: pad(d),
                ddd: dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                M: M + 1,
                MM: pad(M + 1),
                MMM: dF.i18n.monthNames[M],
                MMMM: dF.i18n.monthNames[M + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: pad(H % 12 || 12),
                H: H,
                HH: pad(H),
                m: m,
                mm: pad(m),
                s: s,
                ss: pad(s),
                l: pad(L, 3),
                L: pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : processTZ(date),
                o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S: [ "th", "st", "nd", "rd" ][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };
            return mask.replace(token, function($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();
    dateFormat.masks = {
        default: "dd MMMM yyyy HH:mm:ss Z",
        shortDate: "M/d/yy",
        mediumDate: "MMM d, yyyy",
        longDate: "d MMMM yyyy",
        fullDate: "dddd, MMMM d, yyyy",
        shortTime: "h:mm TT",
        mediumTime: "h:mm:ss TT",
        longTime: "h:mm:ss TT Z",
        isoDate: "yyyy-MM-dd",
        isoTime: "HH:mm:ss",
        isoDateTime: "yyyy-MM-dd'T'HH:mm:ss",
        isoUtcDateTime: "UTC:yyyy-MM-dd'T'HH:mm:ss'Z'"
    };
    dateFormat.i18n = {
        dayNames: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
        monthNames: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
    };
    Date.prototype.format = function(mask, utc) {
        return dateFormat(this, mask, utc);
    };
    return {
        thExpressionObjectName: thExpressionObjectName,
        create: createProxy,
        createNow: createNow,
        createNowForTimeZone: createNow,
        createToday: createToday,
        createTodayForTimeZone: createToday,
        format: format,
        dateFormat: dateFormat,
        arrayFormat: arrayFormat,
        listFormat: arrayFormat,
        setFormat: setFormat,
        day: day,
        arrayDay: arrayDay,
        listDay: arrayDay,
        setDay: setDay,
        month: month,
        arrayMonth: arrayMonth,
        listMonth: arrayMonth,
        setMonth: setMonth,
        monthName: monthName,
        arrayMonthName: arrayMonthName,
        listMonthName: arrayMonthName,
        setMonthName: setMonthName,
        monthNameShort: monthNameShort,
        arrayMonthNameShort: arrayMonthNameShort,
        listMonthNameShort: arrayMonthNameShort,
        setMonthNameShort: setMonthNameShort,
        year: year,
        arrayYear: arrayYear,
        listYear: arrayYear,
        setYear: setYear,
        dayOfWeek: dayOfWeek,
        arrayDayOfWeek: arrayDayOfWeek,
        listDayOfWeek: arrayDayOfWeek,
        setDayOfWeek: setDayOfWeek,
        dayOfWeekName: dayOfWeekName,
        arrayDayOfWeekName: arrayDayOfWeekName,
        listDayOfWeekName: arrayDayOfWeekName,
        setDayOfWeekName: setDayOfWeekName,
        dayOfWeekNameShort: dayOfWeekNameShort,
        arrayDayOfWeekNameShort: arrayDayOfWeekNameShort,
        listDayOfWeekNameShort: arrayDayOfWeekNameShort,
        setDayOfWeekNameShort: setDayOfWeekNameShort,
        hour: hour,
        arrayHour: arrayHour,
        listHour: arrayHour,
        setHour: setHour,
        minute: minute,
        arrayMinute: arrayMinute,
        listMinute: arrayMinute,
        setMinute: setMinute,
        second: second,
        arraySecond: arraySecond,
        listSecond: arraySecond,
        setSecond: setSecond,
        millisecond: millisecond,
        arrayMillisecond: arrayMillisecond,
        listMillisecond: arrayMillisecond,
        setMillisecond: setMillisecond
    };
}();

thymol.objects.thCalendarsObject = function() {
    var thExpressionObjectName = "#calendars";
    return {
        thExpressionObjectName: thExpressionObjectName,
        create: thymol.objects.thDatesObject.create,
        createNow: thymol.objects.thDatesObject.createNow,
        createNowForTimeZone: thymol.objects.thDatesObject.createNow,
        createToday: thymol.objects.thDatesObject.createToday,
        createTodayForTimeZone: thymol.objects.thDatesObject.createToday,
        format: thymol.objects.thDatesObject.format,
        dateFormat: thymol.objects.thDatesObject.dateFormat,
        arrayFormat: thymol.objects.thDatesObject.arrayFormat,
        listFormat: thymol.objects.thDatesObject.arrayFormat,
        setFormat: thymol.objects.thDatesObject.setFormat,
        day: thymol.objects.thDatesObject.day,
        arrayDay: thymol.objects.thDatesObject.arrayDay,
        listDay: thymol.objects.thDatesObject.arrayDay,
        setDay: thymol.objects.thDatesObject.setDay,
        month: thymol.objects.thDatesObject.month,
        arrayMonth: thymol.objects.thDatesObject.arrayMonth,
        listMonth: thymol.objects.thDatesObject.arrayMonth,
        setMonth: thymol.objects.thDatesObject.setMonth,
        monthName: thymol.objects.thDatesObject.monthName,
        arrayMonthName: thymol.objects.thDatesObject.arrayMonthName,
        listMonthName: thymol.objects.thDatesObject.arrayMonthName,
        setMonthName: thymol.objects.thDatesObject.setMonthName,
        monthNameShort: thymol.objects.thDatesObject.monthNameShort,
        arrayMonthNameShort: thymol.objects.thDatesObject.arrayMonthNameShort,
        listMonthNameShort: thymol.objects.thDatesObject.arrayMonthNameShort,
        setMonthNameShort: thymol.objects.thDatesObject.setMonthNameShort,
        year: thymol.objects.thDatesObject.year,
        arrayYear: thymol.objects.thDatesObject.arrayYear,
        listYear: thymol.objects.thDatesObject.arrayYear,
        setYear: thymol.objects.thDatesObject.setYear,
        dayOfWeek: thymol.objects.thDatesObject.dayOfWeek,
        arrayDayOfWeek: thymol.objects.thDatesObject.arrayDayOfWeek,
        listDayOfWeek: thymol.objects.thDatesObject.arrayDayOfWeek,
        setDayOfWeek: thymol.objects.thDatesObject.setDayOfWeek,
        dayOfWeekName: thymol.objects.thDatesObject.dayOfWeekName,
        arrayDayOfWeekName: thymol.objects.thDatesObject.arrayDayOfWeekName,
        listDayOfWeekName: thymol.objects.thDatesObject.arrayDayOfWeekName,
        setDayOfWeekName: thymol.objects.thDatesObject.setDayOfWeekName,
        dayOfWeekNameShort: thymol.objects.thDatesObject.dayOfWeekNameShort,
        arrayDayOfWeekNameShort: thymol.objects.thDatesObject.arrayDayOfWeekNameShort,
        listDayOfWeekNameShort: thymol.objects.thDatesObject.arrayDayOfWeekNameShort,
        setDayOfWeekNameShort: thymol.objects.thDatesObject.setDayOfWeekNameShort,
        hour: thymol.objects.thDatesObject.hour,
        arrayHour: thymol.objects.thDatesObject.arrayHour,
        listHour: thymol.objects.thDatesObject.arrayHour,
        setHour: thymol.objects.thDatesObject.setHour,
        minute: thymol.objects.thDatesObject.minute,
        arrayMinute: thymol.objects.thDatesObject.arrayMinute,
        listMinute: thymol.objects.thDatesObject.arrayMinute,
        setMinute: thymol.objects.thDatesObject.setMinute,
        second: thymol.objects.thDatesObject.second,
        arraySecond: thymol.objects.thDatesObject.arraySecond,
        listSecond: thymol.objects.thDatesObject.arraySecond,
        setSecond: thymol.objects.thDatesObject.setSecond,
        millisecond: thymol.objects.thDatesObject.millisecond,
        arrayMillisecond: thymol.objects.thDatesObject.arrayMillisecond,
        listMillisecond: thymol.objects.thDatesObject.arrayMillisecond,
        setMillisecond: thymol.objects.thDatesObject.setMillisecond
    };
}();

thymol.objects.thIdsObject = function() {
    var thExpressionObjectName = "#ids";
    function seq(id) {
        if (id !== null) {
            var str = id.toString();
            var idCount = getLocal(str);
            var result = str + idCount;
            idCount++;
            setLocal(str, idCount);
            return result;
        }
        idsError("seq ID Cannot be null", this);
    }
    function next(id) {
        if (id !== null) {
            var str = id.toString();
            var idCount = getLocal(str);
            return str + idCount;
        }
        idsError("next ID Cannot be null", this);
    }
    function prev(id) {
        if (id !== null) {
            var str = id.toString();
            var idCount = getLocal(str);
            return str + (idCount - 1);
        }
        idsError("prev ID Cannot be null", this);
    }
    function setLocal(str, idCount) {
        if (!thymol.objects.thIdsObject.thLocalVars) {
            thymol.objects.thIdsObject.thLocalVars = [];
        }
        if (!thymol.objects.thIdsObject.thLocalVars["thIdCounts"]) {
            thymol.objects.thIdsObject.thLocalVars["thIdCounts"] = [];
        }
        thymol.objects.thIdsObject.thLocalVars["thIdCounts"][str] = idCount;
    }
    function getLocal(str) {
        if (!thymol.objects.thIdsObject.thLocalVars) {
            thymol.objects.thIdsObject.thLocalVars = [];
        }
        if (!thymol.objects.thIdsObject.thLocalVars["thIdCounts"]) {
            thymol.objects.thIdsObject.thLocalVars["thIdCounts"] = [];
        }
        if (!thymol.objects.thIdsObject.thLocalVars["thIdCounts"][str]) {
            thymol.objects.thIdsObject.thLocalVars["thIdCounts"][str] = 1;
        }
        return thymol.objects.thIdsObject.thLocalVars["thIdCounts"][str];
    }
    function idsError(text, element) {
        thymol.error(true, "#ids." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        seq: seq,
        next: next,
        prev: prev
    };
}();

thymol.objects.thListsObject = function() {
    var thExpressionObjectName = "#lists";
    function sort(list, comparator) {
        if (list !== null) {
            if (arguments.length > 1) {
                if (comparator !== null) {
                    if (typeof comparator === "function") {
                        return list.sort(comparator);
                    }
                    listsError("sort Cannot execute list sort: comparator is not a function", this);
                }
                listsError("sort Cannot execute list sort: comparator is null", this);
            }
            return list.sort();
        }
        listsError("sort Cannot execute list sort: list is null", this);
    }
    function listsError(text, element) {
        thymol.error(true, "#lists." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        toList: thymol.objects.thArraysObject.toArray,
        size: thymol.objects.thArraysObject.length,
        isEmpty: thymol.objects.thArraysObject.isEmpty,
        contains: thymol.objects.thArraysObject.contains,
        containsAll: thymol.objects.thArraysObject.containsAll,
        sort: sort
    };
}();

thymol.objects.thMapsObject = function() {
    var thExpressionObjectName = "#maps";
    function size(target) {
        if (target !== null) {
            if (target instanceof thymol.ThMap) {
                return target.size();
            }
            mapsError('size Cannot get size of non-map type "' + typeof target + '"', this);
        }
        mapsError("size Cannot get size of null", this);
    }
    function isEmpty(target) {
        if (target !== null) {
            if (target instanceof thymol.ThMap) {
                return target.isEmpty();
            }
            mapsError('size Cannot get isEmpty of non-map type "' + typeof target + '"', this);
        }
        mapsError("size Cannot get isEmpty of null", this);
    }
    function containsKey(target, key) {
        if (target !== null) {
            if (target instanceof thymol.ThMap) {
                return target.containsKey(key);
            }
            mapsError('size Cannot get containsKey of non-map type "' + typeof target + '"', this);
        }
        mapsError("containsKey Cannot execute map containsKey: target is null", this);
    }
    function containsValue(target, value) {
        if (target !== null) {
            if (target instanceof thymol.ThMap) {
                return target.containsValue(value);
            }
            mapsError('size Cannot get containsValue of non-map type "' + typeof target + '"', this);
        }
        mapsError("containsKey Cannot execute map containsValue: target is null", this);
    }
    function containsAllKeys(target, keys) {
        if (target !== null) {
            if (target instanceof thymol.ThMap) {
                var ptc = Object.prototype.toString.call(keys);
                if (keys instanceof thymol.ThSet || keys instanceof Array || ptc === "[object Array]") {
                    return target.containsAll(keys);
                }
                mapsError('size Cannot get containsAllKeys with non-collection type "' + ptc + '"', this);
            }
            mapsError('size Cannot get containsAllKeys of non-map type "' + typeof target + '"', this);
        }
        mapsError("containsKey Cannot execute map containsAllKeys: target is null", this);
    }
    function containsAllValues(target, values) {
        if (target !== null) {
            if (target instanceof thymol.ThMap) {
                var ptc = Object.prototype.toString.call(values);
                if (values instanceof thymol.ThSet || values instanceof Array || ptc === "[object Array]") {
                    var vArray = values;
                    if (values instanceof thymol.ThSet) {
                        vArray = values.toArray();
                    }
                    for (var i = 0, iLimit = vArray.length; i < iLimit; i++) {
                        var found = false;
                        for (var k in target) {
                            if (target.hasOwnProperty(k)) {
                                var value = target[k];
                                if (value === vArray[i]) {
                                    found = true;
                                    break;
                                }
                            }
                        }
                        if (!found) {
                            return false;
                        }
                    }
                    return true;
                }
                mapsError('size Cannot get containsAllValues with non-collection type "' + ptc + '"', this);
            }
            mapsError('size Cannot get containsAllValues of non-map type "' + typeof target + '"', this);
        }
        mapsError("containsKey Cannot execute map containsAllValues: target is null", this);
    }
    function mapsError(text, element) {
        thymol.error(true, "#maps." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        size: size,
        isEmpty: isEmpty,
        containsKey: containsKey,
        containsValue: containsValue,
        containsAllKeys: containsAllKeys,
        containsAllValues: containsAllValues
    };
}();

thymol.objects.thMessagesObject = function() {
    var thExpressionObjectName = "#messages";
    function msg() {
        if (arguments !== null) {
            if (arguments.length > 0) {
                return msgWithParams(arguments[0], Array.prototype.slice.call(arguments, 1));
            }
            messagesError("msg Invoked with no arguments!", this);
        }
        messagesError("msg Target cannot be null", this);
    }
    function msgWithParams(target, params) {
        if (target !== null) {
            return thymol.getMessage(target, params, true);
        }
        messagesError("msgWithParams Target cannot be null", this);
    }
    function msgOrNull() {
        if (arguments !== null) {
            if (arguments.length > 0) {
                return msgOrNullWithParams(arguments[0], Array.prototype.slice.call(arguments, 1));
            }
            messagesError("msgOrNull Invoked with no arguments!", this);
        }
        messagesError("msgOrNull Target cannot be null", this);
    }
    function msgOrNullWithParams(target, params) {
        if (target !== null) {
            return thymol.getMessage(target, params, false);
        }
        messagesError("msgOrNullWithParams Target cannot be null", this);
    }
    function arrayMsg() {
        if (arguments !== null) {
            if (arguments.length > 0) {
                return arrayMsgWithParams(arguments[0], Array.prototype.slice.call(arguments, 1));
            }
            messagesError("arrayMsg Invoked with no arguments!", this);
        }
        messagesError("arrayMsg Target cannot be null", this);
    }
    function arrayMsgWithParams(target, params) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(msgWithParams(target[i], params));
            }
            return result;
        }
        messagesError("arrayMsgWithParams Target cannot be null", this);
    }
    function setMsg() {
        if (arguments !== null) {
            if (arguments.length > 0) {
                return setMsgWithParams(arguments[0], Array.prototype.slice.call(arguments, 1));
            }
            messagesError("setMsg Invoked with no arguments!", this);
        }
        messagesError("setMsg Target cannot be null", this);
    }
    function setMsgWithParams(target, params) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(msgWithParams(target[k], params));
                }
            }
            return result;
        }
        messagesError("setMsgWithParams Target cannot be null", this);
    }
    function arrayMsgOrNull() {
        if (arguments !== null) {
            if (arguments.length > 0) {
                return arrayMsgOrNullWithParams(arguments[0], Array.prototype.slice.call(arguments, 1));
            }
            messagesError("arrayMsgOrNull Invoked with no arguments!", this);
        }
        messagesError("arrayMsgOrNull Target cannot be null", this);
    }
    function arrayMsgOrNullWithParams(target, params) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(msgOrNullWithParams(target[i], params));
            }
            return result;
        }
        messagesError("arrayMsgOrNullWithParams Target cannot be null", this);
    }
    function setMsgOrNull() {
        if (arguments !== null) {
            if (arguments.length > 0) {
                return setMsgOrNullWithParams(arguments[0], Array.prototype.slice.call(arguments, 1));
            }
            messagesError("setMsgOrNull Invoked with no arguments!", this);
        }
        messagesError("setMsgOrNull Target cannot be null", this);
    }
    function setMsgOrNullWithParams(target, params) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(msgOrNullWithParams(target[k], params));
                }
            }
            return result;
        }
        messagesError("setMsgOrNullWithParams Target cannot be null", this);
    }
    function messagesError(text, element) {
        thymol.error(true, "#messages." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        msg: msg,
        msgWithParams: msgWithParams,
        msgOrNull: msgOrNull,
        msgOrNullWithParams: msgOrNullWithParams,
        arrayMsg: arrayMsg,
        listMsg: arrayMsg,
        setMsg: setMsg,
        arrayMsgWithParams: arrayMsgWithParams,
        listMsgWithParams: arrayMsgWithParams,
        setMsgWithParams: setMsgWithParams,
        arrayMsgOrNull: arrayMsgOrNull,
        listMsgOrNull: arrayMsgOrNull,
        setMsgOrNull: setMsgOrNull,
        arrayMsgOrNullWithParams: arrayMsgOrNullWithParams,
        listMsgOrNullWithParams: arrayMsgOrNullWithParams,
        setMsgOrNullWithParams: setMsgOrNullWithParams
    };
}();

thymol.objects.thNumbersObject = function() {
    var thExpressionObjectName = "#numbers";
    var DEFAULT_THOU_PT = ",";
    var DEFAULT_DECI_PT = ".";
    var DEFAULT_NONE_PT = "?";
    function formatDecimalProxy() {
        if (arguments !== null) {
            if (arguments.length > 4) {
                return formatDecimal5(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
            } else if (arguments.length > 3) {
                return formatDecimal4(arguments[0], arguments[1], arguments[2], arguments[3]);
            }
            return formatDecimal3(arguments[0], arguments[1], arguments[2]);
        }
    }
    function formatIntegerProxy() {
        if (arguments !== null) {
            if (arguments.length > 4) {
                return formatDecimal5(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
            } else if (arguments.length > 3) {
                return formatDecimal5(arguments[0], arguments[1], "NONE", arguments[2], arguments[3]);
            } else if (arguments.length > 2) {
                if (typeof arguments[2] === "string") {
                    return formatDecimal5(arguments[0], arguments[1], arguments[2], 0, "POINT");
                }
                return formatDecimal5(arguments[0], arguments[1], "NONE", arguments[2], "POINT");
            } else {
                return formatDecimal5(arguments[0], arguments[1], "NONE", 0, "POINT");
            }
        }
    }
    function arrayFormatIntegerProxy() {
        if (arguments !== null) {
            if (arguments.length > 2) {
                return arrayFormatDecimal(arguments[0], arguments[1], arguments[2], 0, "POINT");
            }
            return arrayFormatDecimal(arguments[0], arguments[1], "NONE", 0, "POINT");
        }
    }
    function setFormatIntegerProxy() {
        if (arguments !== null) {
            if (arguments.length > 2) {
                return setFormatDecimal(arguments[0], arguments[1], arguments[2], 0, "POINT");
            }
            return setFormatDecimal(arguments[0], arguments[1], "NONE", 0, "POINT");
        }
    }
    function arrayFormatDecimalProxy() {
        if (arguments !== null) {
            if (arguments.length > 4) {
                return arrayFormatDecimal(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
            } else if (arguments.length > 3) {
                return arrayFormatDecimal(arguments[0], arguments[1], "NONE", arguments[2], arguments[3]);
            }
            return arrayFormatDecimal(arguments[0], arguments[1], "NONE", arguments[2], "POINT");
        }
    }
    function setFormatDecimalProxy() {
        if (arguments !== null) {
            if (arguments.length > 4) {
                return setFormatDecimal(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
            } else if (arguments.length > 3) {
                return setFormatDecimal(arguments[0], arguments[1], "NONE", arguments[2], arguments[3]);
            }
            return setFormatDecimal(arguments[0], arguments[1], "NONE", arguments[2], "POINT");
        }
    }
    function sequenceProxy() {
        if (arguments !== null) {
            if (arguments.length > 2) {
                return sequence(arguments[0], arguments[1], arguments[2]);
            }
            return sequence(arguments[0], arguments[1], 1);
        }
    }
    function getIntegerDigits(val) {
        var s = val.toString();
        var digits = s.length;
        var dp = s.indexOf(".");
        if (dp > 0) {
            digits = dp;
        }
        return digits;
    }
    function formatDecimal3(target, minIntegerDigits, decimalDigits) {
        var result = target.toString();
        var value = new Number(target);
        value = value.toFixed(decimalDigits);
        if (minIntegerDigits > 0) {
            result = value;
            value = new Number(value);
            var a = Math.abs(value);
            if (a < Math.pow(10, minIntegerDigits)) {
                if (target < 0) {
                    result = result.substring(1);
                }
                var p = getIntegerDigits(a);
                var x = minIntegerDigits - p;
                if (x > 0) {
                    for (var i = 0; i < x; i++) {
                        result = "0" + result;
                    }
                }
                if (target < 0) {
                    result = "-" + result;
                }
            }
        } else {
            result = value.toString();
        }
        result = new String(result);
        result.precision = decimalDigits;
        return result;
    }
    function formatDecimal4(target, minIntegerDigits, decimalDigits, decimalPointType) {
        var result = formatDecimal3(target, minIntegerDigits, decimalDigits);
        var decimalPoint;
        if ("DEFAULT" === decimalPointType) {
            decimalPoint = DEFAULT_DECI_PT;
        } else if ("NONE" === decimalPointType) {
            decimalPoint = DEFAULT_NONE_PT;
        } else {
            decimalPoint = getPointType(decimalPointType);
        }
        if ("." !== decimalPoint) {
            result = result.replace(".", decimalPoint, "g");
        }
        return result;
    }
    function formatDecimal5(target, minIntegerDigits, thousandsPointType, decimalDigits, decimalPointType) {
        var result = target.toString();
        var decimalPoint;
        if ("DEFAULT" === decimalPointType) {
            decimalPoint = DEFAULT_DECI_PT;
        } else if ("NONE" === decimalPointType) {
            decimalPoint = DEFAULT_NONE_PT;
        } else {
            decimalPoint = getPointType(decimalPointType);
        }
        if ("" !== decimalPoint) {
            result = formatDecimal4(target, minIntegerDigits, decimalDigits, decimalPointType);
        } else {
            result = formatDecimal3(target, minIntegerDigits, decimalDigits);
        }
        var thousandsPoint;
        if ("DEFAULT" === thousandsPointType) {
            thousandsPoint = DEFAULT_THOU_PT;
        } else {
            thousandsPoint = getPointType(thousandsPointType);
        }
        if ("" !== thousandsPoint) {
            result = addThousandsPointType(result.toString(), decimalPoint, thousandsPoint);
        }
        return result;
    }
    function getPointType(type) {
        var result = ".";
        if ("COMMA" === type) {
            result = ",";
        } else if ("WHITESPACE" === type) {
            result = " ";
        } else if ("NONE" === type) {
            result = "";
        }
        return result;
    }
    function arrayFormatDecimal(target, minIntegerDigits, thousandsPointType, decimalDigits, decimalPointType) {
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(formatDecimal5(target[i], minIntegerDigits, thousandsPointType, decimalDigits, decimalPointType));
        }
        return result;
    }
    function setFormatDecimal(target, minIntegerDigits, thousandsPointType, decimalDigits, decimalPointType) {
        var result = new thymol.ThSet();
        for (var k in target) {
            if (target.hasOwnProperty(k) && typeof target[k] !== "function") {
                result.add(formatDecimal5(target[k], minIntegerDigits, thousandsPointType, decimalDigits, decimalPointType));
            }
        }
        return result;
    }
    function addThousandsPointType(nStr, dpt, tpt) {
        var x = nStr.split(dpt);
        var x1 = x[0];
        var x2 = x.length > 1 ? dpt + x[1] : "";
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, "$1" + tpt + "$2");
        }
        return x1 + x2;
    }
    function sequence(start, stop, step) {
        var result = [];
        if (step > 0) {
            var value = start;
            if (start <= stop) {
                do {
                    result.push(value);
                    value += step;
                } while (value <= stop);
            } else {
                do {
                    result.push(value);
                    value -= step;
                } while (value >= stop);
            }
        }
        return result;
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        formatDecimal: formatDecimalProxy,
        formatInteger: formatIntegerProxy,
        arrayFormatInteger: arrayFormatIntegerProxy,
        arrayFormatDecimal: arrayFormatDecimalProxy,
        listFormatInteger: arrayFormatIntegerProxy,
        listFormatDecimal: arrayFormatDecimalProxy,
        setFormatInteger: setFormatIntegerProxy,
        setFormatDecimal: setFormatDecimalProxy,
        sequence: sequenceProxy
    };
}();

thymol.objects.thObjectsObject = function() {
    var thExpressionObjectName = "#objects";
    function nullSafe(target, defaultValue) {
        return target != null ? target : defaultValue;
    }
    function arrayNullSafe(target, defaultValue) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(nullSafe(target[i], defaultValue));
            }
            return result;
        }
        objectsError("arrayNullSafe Target cannot be null", this);
    }
    function setNullSafe(target, defaultValue) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(nullSafe(target[k], defaultValue));
                }
            }
            return result;
        }
        objectsError("setNullSafe Target cannot be null", this);
    }
    function objectsError(text, element) {
        thymol.error(true, "#objects." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        nullSafe: nullSafe,
        arrayNullSafe: arrayNullSafe,
        listNullSafe: arrayNullSafe,
        setNullSafe: setNullSafe
    };
}();

thymol.objects.thSetsObject = function() {
    var thExpressionObjectName = "#sets";
    function toSet(target) {
        if (target !== null) {
            var tt = typeof target;
            var ptc = Object.prototype.toString.call(target);
            var result;
            if (tt === "thymol.ThSet") {
                result = target;
            }
            if (tt === "Array" || ptc === "[object Array]") {
                result = thymol.ThSet.prototype.fromArray(target);
            } else if (tt === "object") {
                result = new thymol.ThSet();
                for (var k in target) {
                    var value = target[k];
                    var process = false;
                    if (value !== null) {
                        if (target instanceof thymol.ThSet) {
                            process = target.isContent(k);
                        } else {
                            process = target.hasOwnProperty(k) && typeof value !== "function";
                        }
                    }
                    if (process) {
                        result.add(value);
                    }
                }
            } else {
                setsError('toSet Cannot convert object of type "' + tt + '" to a set', this);
            }
            return result;
        }
        setsError("toSet Cannot convert null to set", this);
    }
    function size(target) {
        if (target !== null) {
            if (target instanceof thymol.ThSet) {
                return target.size();
            }
            setsError('size Cannot get size of non-set type "' + typeof target + '"', this);
        }
        setsError("size Cannot get size of null", this);
    }
    function isEmpty(target) {
        if (target !== null) {
            if (target instanceof thymol.ThSet) {
                return target.isEmpty();
            }
            setsError('size Cannot get isEmpty of non-set type "' + typeof target + '"', this);
        }
        setsError("size Cannot get isEmpty of null", this);
    }
    function contains(target, element) {
        if (target !== null) {
            for (var k in target) {
                if (target.isContent(k)) {
                    if (target[k] === null) {
                        if (element === null) {
                            return true;
                        }
                    } else if (element !== null && target[k] === element) {
                        return true;
                    }
                }
            }
            return false;
        }
        setsError("contains Cannot execute sets contains: target is null", this);
    }
    function containsAll(target, elements) {
        if (target !== null) {
            if (elements !== null) {
                var elementsArray;
                if (elements instanceof Array) {
                    elementsArray = [].concat(elements);
                } else {
                    if (elements instanceof thymol.ThSet) {
                        elementsArray = elements.toArray();
                    } else {
                        elementsArray = [];
                        for (var k in elements) {
                            if (elements.hasOwnProperty(k) && typeof elements[k] !== "function") {
                                elementsArray.push(elements[k]);
                            }
                        }
                    }
                }
                for (var k in target) {
                    if (target.isContent(k)) {
                        for (var j = 0, jLimit = elementsArray.length; j < jLimit; j++) {
                            if (target[k] === elementsArray[j]) {
                                elementsArray.splice(j, 1);
                            }
                        }
                    }
                }
                return elementsArray.length === 0;
            }
            setsError("containsAll Cannot execute sets containsAll: elements is null", this);
        }
        setsError("containsAll Cannot execute sets containsAll: target is null", this);
    }
    function setsError(text, element) {
        thymol.error(true, "#sets." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        toSet: toSet,
        size: size,
        isEmpty: isEmpty,
        contains: contains,
        containsAll: containsAll
    };
}();

thymol.objects.thStringsObject = function() {
    var thExpressionObjectName = "#strings";
    function toString(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = target.toString();
        }
        return result;
    }
    function arrayToString(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(target[i].toString());
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setToString(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(toString(target[k]));
                }
            }
        }
        return result;
    }
    function abbreviate(target, maxSize, source) {
        if (maxSize >= 3) {
            var result = null;
            if (target !== null && typeof target !== "undefined") {
                result = target.toString();
                if (result.length > maxSize) {
                    result = result.substring(0, maxSize - 3) + "...";
                }
            }
            return result;
        }
        throwAbbreviateException("abbreviate", maxSize, this);
    }
    function arrayAbbreviate(target, maxSize) {
        if (maxSize >= 3) {
            var result = null;
            if (target !== null && typeof target !== "undefined") {
                result = [];
                for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                    result.push(abbreviate(target[i], maxSize));
                }
            }
            return result;
        }
        throwAbbreviateException("arrayAbbreviate", maxSize, this);
    }
    function setAbbreviate(target, maxSize) {
        if (maxSize >= 3) {
            var result = null;
            if (target !== null && typeof target !== "undefined") {
                result = new thymol.ThSet();
                for (var k in target) {
                    if (target.isContent(k)) {
                        result.add(abbreviate(target[k], maxSize));
                    }
                }
            }
            return result;
        }
        throwAbbreviateException("setAbbreviate", maxSize, this);
    }
    function throwAbbreviateException(source, maxSize, element) {
        stringsError("" + source + ' Maximum size must be greater than or equal to 3 but was: "' + maxSize + '"', element);
    }
    function equals(o1, o2) {
        if (o1 === null) {
            return o2 === null;
        } else if (o2 !== null) {
            return o1.toString() === o2.toString();
        }
        return false;
    }
    function equalsIgnoreCase(o1, o2) {
        if (o1 === null) {
            return o2 === null;
        } else if (o2 !== null) {
            return o1.toString().toLowerCase() === o2.toString().toLowerCase();
        }
        return false;
    }
    function contains(target, fragment) {
        if (target !== null) {
            if (fragment !== null) {
                return target.toString().indexOf(fragment) >= 0;
            }
            stringsError("contains Fragment cannot be null", this);
        }
        stringsError("contains Cannot apply contains on null", this);
    }
    function arrayContains(target, fragment) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(contains(target[i], fragment));
            }
            return result;
        }
        stringsError("arrayContains Cannot apply arrayContains on null", this);
    }
    function setContains(target, fragment) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(contains(target[k], fragment));
                }
            }
            return result;
        }
        stringsError("setContains Cannot apply setContains on null", this);
    }
    function containsIgnoreCase(target, fragment) {
        if (target !== null) {
            if (fragment !== null) {
                return target.toString().toLowerCase().indexOf(fragment.toLowerCase()) >= 0;
            }
            stringsError("containsIgnoreCase Fragment cannot be null", this);
        }
        stringsError("containsIgnoreCase Cannot apply containsIgnoreCase on null", this);
    }
    function arrayContainsIgnoreCase(target, fragment) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(containsIgnoreCase(target[i], fragment));
            }
            return result;
        }
        stringsError("arrayContainsIgnoreCase Cannot apply arrayContainsIgnoreCase on null", this);
    }
    function setContainsIgnoreCase(target, fragment) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(containsIgnoreCase(target[k], fragment));
                }
            }
            return result;
        }
        stringsError("setContainsIgnoreCase Cannot apply setContainsIgnoreCase on null", this);
    }
    function startsWith(target, prefix) {
        if (target !== null) {
            if (prefix !== null) {
                return target.toString().indexOf(prefix) === 0;
            }
            stringsError("startsWith Prefix cannot be null", this);
        }
        stringsError("startsWith Cannot apply startsWith on null", this);
    }
    function arrayStartsWith(target, prefix) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(startsWith(target[i], prefix));
            }
            return result;
        }
        stringsError("arrayStartsWith Target cannot be null", this);
    }
    function setStartsWith(target, prefix) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(startsWith(target[k], prefix));
                }
            }
            return result;
        }
        stringsError("setStartsWith Target cannot be null", this);
    }
    function endsWith(target, suffix) {
        if (target !== null) {
            if (suffix !== null) {
                var str = target.toString();
                return str.indexOf(suffix) === str.length - suffix.length;
            }
            stringsError("startsWith Suffix cannot be null", this);
        }
        stringsError("endsWith Cannot apply endsWith on null", this);
    }
    function arrayEndsWith(target, suffix) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(endsWith(target[i], suffix));
            }
            return result;
        }
        stringsError("arrayEndsWith Target cannot be null", this);
    }
    function setEndsWith(target, suffix) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(endsWith(target[k], suffix));
                }
            }
            return result;
        }
        stringsError("setEndsWith Target cannot be null", this);
    }
    function substring(target, start, end) {
        if (target !== null) {
            return target.toString().substring(start, end);
        }
        stringsError("substring Target cannot be null", this);
    }
    function arraySubstring(target, start, end) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(substring(target[i], start, end));
            }
            return result;
        }
        stringsError("arraySubstring Target cannot be null", this);
    }
    function setSubstring(target, start, end) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(substring(target[k], start, end));
                }
            }
            return result;
        }
        stringsError("setSubstring Target cannot be null", this);
    }
    function substringAfter(target, substr) {
        if (target !== null) {
            if (substr !== null) {
                var str = target.toString();
                var indx = str.indexOf(substr);
                if (indx < 0) {
                    return null;
                }
                return str.substring(indx + substr.length);
            }
            stringsError("substringAfter Parameter substring cannot be null", this);
        }
        stringsError("substringAfter Cannot apply substringAfter on null", this);
    }
    function arraySubstringAfter(target, substr) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(substringAfter(target[i], substr));
            }
            return result;
        }
        stringsError("arraySubstringAfter Cannot apply arraySubstringAfter on null", this);
    }
    function setSubstringAfter(target, substr) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(substringAfter(target[k], substr));
                }
            }
            return result;
        }
        stringsError("setSubstringAfter Cannot apply setSubstringAfter on null", this);
    }
    function substringBefore(target, substr) {
        if (target !== null) {
            if (substr !== null) {
                var str = target.toString();
                var indx = str.indexOf(substr);
                if (indx < 0) {
                    return null;
                }
                return str.substring(0, indx);
            }
            stringsError("substringBefore Parameter substring cannot be null", this);
        }
        stringsError("substringBefore Cannot apply substringBefore on null", this);
    }
    function arraySubstringBefore(target, substr) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(substringBefore(target[i], substr));
            }
            return result;
        }
        stringsError("arraySubstringBefore Cannot apply arraySubstringBefore on null", this);
    }
    function setSubstringBefore(target, substr) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(substringBefore(target[k], substr));
                }
            }
            return result;
        }
        stringsError("setSubstringBefore Cannot apply setSubstringBefore on null", this);
    }
    function prepend(target, prefix) {
        if (target !== null) {
            if (prefix !== null) {
                return prefix.toString() + target.toString();
            }
            stringsError("prepend Prefix cannot be null", this);
        }
        stringsError("prepend Cannot apply prepend on null", this);
    }
    function arrayPrepend(target, prefix) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(prepend(target[i], prefix));
            }
            return result;
        }
        stringsError("arrayPrepend Cannot apply arrayPrepend on null", this);
    }
    function setPrepend(target, prefix) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(prepend(target[k], prefix));
                }
            }
            return result;
        }
        stringsError("setPrepend Cannot apply setPrepend on null", this);
    }
    function repeat(target, times) {
        var result = "";
        for (var i = 0; i < times; i++) {
            result += target.toString();
        }
        return result;
    }
    function append(target, suffix) {
        if (target !== null) {
            if (suffix !== null) {
                return target.toString() + suffix.toString();
            }
            stringsError("append Suffix cannot be null", this);
        }
        stringsError("append Cannot apply append on null", this);
    }
    function concat() {
        var result = "";
        for (var i = 0, iLimit = arguments.length; i < iLimit; i++) {
            if (arguments[i] !== null) {
                result += arguments[i];
            }
        }
        return result;
    }
    function concatReplaceNulls() {
        var result = "";
        for (var i = 1, iLimit = arguments.length; i < iLimit; i++) {
            if (arguments[i] === null) {
                result += arguments[0];
            } else {
                result += arguments[i];
            }
        }
        return result;
    }
    function arrayAppend(target, suffix) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(append(target[i], suffix));
            }
            return result;
        }
        stringsError("arrayAppend Target cannot be null", this);
    }
    function setAppend(target, suffix) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(append(target[k], suffix));
                }
            }
            return result;
        }
        stringsError("setAppend Target cannot be null", this);
    }
    function indexOf(target, fragment) {
        if (target !== null) {
            if (fragment !== null) {
                var str = target.toString();
                var indx = str.indexOf(fragment);
                return indx;
            }
            stringsError("indexOf Fragment cannot be null", this);
        }
        stringsError("indexOf Cannot apply indexOf on null", this);
    }
    function arrayIndexOf(target, fragment) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(indexOf(target[i], fragment));
            }
            return result;
        }
        stringsError("arrayIndexOf Cannot apply arrayIndexOf on null", this);
    }
    function setIndexOf(target, fragment) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(indexOf(target[k], fragment));
                }
            }
            return result;
        }
        stringsError("setIndexOf Cannot apply setIndexOf on null", this);
    }
    function isEmpty(target) {
        if (target !== null) {
            var str = target.toString();
            if (str !== null) {
                str = str.replace(/(?:[\\]t)/g, "\t").replace(/(?:[\\]n)/g, "\n").replace(/(?:[\\]v)/g, "\v").replace(/(?:[\\]f)/g, "\f").replace(/(?:[\\]r)/g, "\r");
                str = str.trim();
                if (str.length !== 0) {
                    return false;
                }
            }
        }
        return true;
    }
    function arrayIsEmpty(target) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(isEmpty(target[i]));
            }
            return result;
        }
        stringsError("arrayIsEmpty Target cannot be null", this);
    }
    function setIsEmpty(target) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(isEmpty(target[k]));
                }
            }
            return result;
        }
        stringsError("setIsEmpty Target cannot be null", this);
    }
    function arrayJoin(stringArray, separator) {
        if (stringArray !== null) {
            if (separator !== null) {
                var sepStr = separator.toString();
                var result = "";
                for (var i = 0, iLimit = stringArray.length; i < iLimit; i++) {
                    if ("" !== result) {
                        result += sepStr;
                    }
                    result += stringArray[i];
                }
                return result;
            }
            stringsError("arrayJoin Separator cannot be null", this);
        }
        stringsError("arrayJoin Cannot apply join on null", this);
    }
    function setJoin(stringSet, separator) {
        if (stringSet !== null) {
            if (separator !== null) {
                var sepStr = separator.toString();
                var result = "";
                for (var k in stringSet) {
                    if (stringSet.isContent(k)) {
                        if ("" !== result) {
                            result += sepStr;
                        }
                        result += stringSet[k];
                    }
                }
                return result;
            }
            stringsError("setJoin Separator cannot be null", this);
        }
        stringsError("setJoin Cannot apply join on null", this);
    }
    function doRegExpify(target, flags) {
        var result = target.toString();
        result = result.replace(/[\\]/g, "\\").replace(/[\^]/g, "^").replace(/[\[]/g, "[").replace(/[\]]/g, "]").replace(/[\(]/g, "(").replace(/[\)]/g, ")");
        result = "[" + result + "]";
        return new RegExp(result, flags);
    }
    function doSplit(target, separator) {
        var re = doRegExpify(separator);
        var splits = target.split(re);
        var result = [];
        for (var i = 0, iLimit = splits.length; i < iLimit; i++) {
            if (splits[i]) {
                result.push(splits[i]);
            }
        }
        return result;
    }
    function arraySplit(target, separator) {
        if (target !== null) {
            if (separator !== null) {
                return doSplit(target, separator);
            }
            stringsError("arraySplit Separator cannot be null", this);
        }
        stringsError("arraySplit Cannot apply split on null", this);
    }
    function setSplit(target, separator) {
        if (target !== null) {
            if (separator !== null) {
                var result = new thymol.ThSet();
                var splits = doSplit(target, separator);
                for (var i = 0, iLimit = splits.length; i < iLimit; i++) {
                    result.add(splits[i]);
                }
                return result;
            }
            stringsError("setSplit Separator cannot be null", this);
        }
        stringsError("setSplit Cannot apply split on null", this);
    }
    function length(target) {
        if (target !== null) {
            return target.toString().length;
        }
        stringsError("length Cannot apply length on null", this);
    }
    function arrayLength(target) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(length(target[i]));
            }
            return result;
        }
        stringsError("arrayLength Target cannot be null", this);
    }
    function setLength(target) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(length(target[k]));
                }
            }
            return result;
        }
        stringsError("setLength Target cannot be null", this);
    }
    function getReplacer(target) {
        var bfr = target.replace(/[$]/g, "[$]").replace(/[*]/g, "[*]").replace(/[\']/g, "[']").replace(/[+]/g, "[+]").replace(/[\(]/g, "[(]").replace(/[\)]/g, "[)]");
        return new RegExp(bfr, "g");
    }
    function replace(target, before, after) {
        if (target !== null) {
            if (before !== null) {
                var bfr = unescapeXml(before);
                if (after !== null) {
                    var re = getReplacer(bfr);
                    var aft = unescapeXml(after);
                    return target.replace(re, aft);
                }
                stringsError("replace After cannot be null", this);
            }
            stringsError("replace Before cannot be null", this);
        }
        stringsError("replace Cannot apply replace on null", this);
    }
    function arrayReplace(target, before, after) {
        if (target !== null) {
            if (before !== null) {
                var bfr = unescapeXml(before);
                if (after !== null) {
                    var re = getReplacer(bfr);
                    var aft = unescapeXml(after);
                    var result = [];
                    for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                        result.push(target[i].toString().replace(re, aft));
                    }
                    return result;
                }
                stringsError("arrayReplace After cannot be null", this);
            }
            stringsError("arrayReplace Before cannot be null", this);
        }
        stringsError("arrayReplace Cannot apply replace on null", this);
    }
    function setReplace(target, before, after) {
        if (target !== null) {
            if (before !== null) {
                var bfr = unescapeXml(before);
                if (after !== null) {
                    var re = getReplacer(bfr);
                    var aft = unescapeXml(after);
                    var result = new thymol.ThSet();
                    for (var k in target) {
                        if (target.isContent(k)) {
                            result.add(target[k].toString().replace(re, aft));
                        }
                    }
                    return result;
                }
                stringsError("setReplace Array of 'after' values cannot be null", this);
            }
            stringsError("setReplace Array of 'before' values cannot be null", this);
        }
        stringsError("setReplace Cannot apply replace on null", this);
    }
    function multipleReplace(target, before, after) {
        if (target !== null) {
            if (before !== null) {
                if (Object.prototype.toString.call(before) == "[object Array]") {
                    if (after !== null) {
                        if (Object.prototype.toString.call(after) == "[object Array]") {
                            if (before.length === after.length) {
                                var result = target;
                                var bfr, aft;
                                for (var i = 0, iLimit = before.length; i < iLimit; i++) {
                                    bfr = unescapeXml(before[i]);
                                    var re = getReplacer(bfr);
                                    aft = unescapeXml(after[i]);
                                    result = result.replace(re, aft);
                                }
                                return result;
                            }
                            stringsError("multipleReplace Arrays of 'before' and 'after' values must have the same length", this);
                        }
                        stringsError("multipleReplace After must be an array type", this);
                    }
                    stringsError("multipleReplace After cannot be null", this);
                }
                stringsError("multipleReplace Before must be an array type", this);
            }
            stringsError("multipleReplace Before cannot be null", this);
        }
        stringsError("multipleReplace Target cannot be null", this);
    }
    function arrayMultipleReplace(target, before, after) {
        if (target !== null) {
            var result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                result.push(multipleReplace(target[i].toString(), before, after));
            }
            return result;
        }
        stringsError("arrayMultipleReplace Target cannot be null", this);
    }
    function setMultipleReplace(target, before, after) {
        if (target !== null) {
            var result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(multipleReplace(target[k].toString(), before, after));
                }
            }
            return result;
        }
        stringsError("setMultipleReplace Target cannot be null", this);
    }
    function toUpperCase(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = target.toString().toUpperCase();
        }
        return result;
    }
    function arrayToUpperCase(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(target[i].toString().toUpperCase());
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setToUpperCase(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(target[k].toString().toUpperCase());
                }
            }
        }
        return result;
    }
    function toLowerCase(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = target.toString().toLowerCase();
        }
        return result;
    }
    function arrayToLowerCase(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(target[i].toString().toLowerCase());
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setToLowerCase(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(target[k].toString().toLowerCase());
                }
            }
        }
        return result;
    }
    function trim(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = target.toString().trim();
        }
        return result;
    }
    function arrayTrim(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(target[i].toString().trim());
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setTrim(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(target[k].toString().trim());
                }
            }
        }
        return result;
    }
    function capitalize(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = target.toString();
            if (result.length > 0) {
                result = result.charAt(0).toUpperCase() + result.substr(1);
            }
        }
        return result;
    }
    function arrayCapitalize(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(capitalize(target[i]));
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setCapitalize(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(capitalize(target[k]));
                }
            }
        }
        return result;
    }
    function unCapitalize(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = target.toString();
            if (result.length > 0) {
                result = result.charAt(0).toLowerCase() + result.substr(1);
            }
        }
        return result;
    }
    function arrayUnCapitalize(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(unCapitalize(target[i]));
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setUnCapitalize(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(unCapitalize(target[k]));
                }
            }
        }
        return result;
    }
    function capitalizeWords(target, delimiters) {
        var splitter;
        if (typeof delimiters === "undefined") {
            splitter = new RegExp("[^ \t\r\n\f\v]\\w*", "g");
        } else {
            var spec = "[^ " + delimiters + "]\\w*";
            splitter = new RegExp(spec, "g");
        }
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            var str = target.toString();
            if (str.length > 0) {
                result = "";
                var matched;
                var indx = 0;
                while ((matched = splitter.exec(str)) !== null) {
                    result += str.substring(indx, matched.index);
                    result += matched[0].charAt(0).toUpperCase() + matched[0].substr(1);
                    indx = splitter.lastIndex;
                }
                result += str.substring(indx);
            }
        }
        return result;
    }
    function arrayCapitalizeWords(target, delimiters) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(capitalizeWords(target[i], delimiters));
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setCapitalizeWords(target, delimiters) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(capitalizeWords(target[k], delimiters));
                }
            }
        }
        return result;
    }
    function escapeXml(target, escapeQuotesParam) {
        var result = target;
        if (target !== null && typeof target !== "undefined") {
            var escapeQuotes = escapeQuotesParam !== null && typeof escapeQuotesParam !== "undefined" && escapeQuotesParam;
            if (escapeQuotes) {
                result = escapeXmlTrue(target);
            } else {
                result = "";
                for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                    var c = target.charAt(i);
                    if (c === "&") {
                        if (!isEntityStart(target, i)) {
                            c = "&amp;";
                        }
                    } else if (c === "<") {
                        c = "&amp;lt;";
                    } else if (c === ">") {
                        c = "&amp;gt;";
                    } else if (c === '"') {
                        c = "&amp;quot;";
                    } else if (c === "'") {
                        c = "&amp;#39;";
                    }
                    result += c;
                }
            }
        }
        return result;
    }
    function escapeXmlTrue(target) {
        var result = "";
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            var c = target.charAt(i);
            if (c === "&") {
                if (!isEntityStart(target, i)) {
                    c = "&amp;";
                }
            } else if (c === "<") {
                c = "&lt;";
            } else if (c === ">") {
                c = "&gt;";
            } else if (c === '"') {
                c = "&quot;";
            } else if (c === "'") {
                c = "&#39;";
            }
            result += c;
        }
        return result;
    }
    function unescapeXml(target) {
        var result = "";
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            var c = target.charAt(i);
            if (c === "&") {
                c = isEntity(target, i);
                if (c !== "&") {
                    i += c.length;
                    if (c === "&lt;") {
                        c = "<";
                    } else if (c === "&gt;") {
                        c = ">";
                    } else if (c === "&amp;") {
                        c = "&";
                    } else if (c === "&quot;") {
                        c = '"';
                    } else if (c === "&#39;") {
                        c = "'";
                    }
                } else {
                    c = "&amp;";
                }
            }
            result += c;
        }
        return result;
    }
    function isEntity(buffer, position) {
        var entity = "&";
        var i = position + 1;
        while (i < buffer.length) {
            var c = buffer[i];
            if (!(c >= "A" && c <= "Z" || c >= "a" && c <= "z" || c >= "0" && c <= "9" || c == ";" || c == "#")) {
                return "&";
            }
            entity += c;
            if (c == ";") {
                return entity;
            }
            i++;
        }
        return "&";
    }
    function isEntityStart(buffer, position) {
        var i = position + 1;
        while (i < buffer.length) {
            var c = buffer[i];
            if (!(c >= "A" && c <= "Z" || c >= "a" && c <= "z" || c >= "0" && c <= "9" || c == ";" || c == "#")) {
                return false;
            }
            if (c == ";") {
                return true;
            }
            i++;
        }
        return false;
    }
    function arrayEscapeXml(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(escapeXml(target[i], false));
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setEscapeXml(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(escapeXml(target[k], false));
                }
            }
        }
        return result;
    }
    function escapeJavaScript(target) {
        var result = target;
        if (target !== null && typeof target !== "undefined") {
            result = escapeJavaAny(target, true);
        }
        return result;
    }
    function escapeJavaAny(target, javaScript) {
        var result = "";
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            var c = target.charAt(i);
            var cc = target.charCodeAt(i);
            if (cc >= 32 && cc <= 127) {
                switch (c) {
                  case "\\":
                    c = "\\";
                    break;

                  case '"':
                    c = '\\"';
                    break;

                  case "'":
                    if (javaScript) {
                        c = "\\'";
                    }
                    break;

                  case "/":
                    if (javaScript) {
                        if (i > 0 && target.charAt(i - 1) == "<") {
                            c = "\\/";
                        }
                    }
                    break;

                  case ">":
                    if (javaScript && i > 1) {
                        if (target.charAt(i - 1) == "]" && target.charAt(i - 2) == "]") {
                            c = "\\>";
                        }
                    }
                    break;

                  default:
                    break;
                }
            } else {
                switch (c) {
                  case "\t":
                    c = "\\t";
                    break;

                  case "\n":
                    c = "\\n";
                    break;

                  case "\b":
                    c = "\\b";
                    break;

                  case "\f":
                    c = "\\f";
                    break;

                  case "\r":
                    c = "\\r";
                    break;

                  default:
                    if (javaScript) {
                        c = hexEscape(cc);
                    } else {
                        c = unicodeEscape(cc);
                    }
                    break;
                }
            }
            result += c;
        }
        return result;
    }
    function unicodeEscape(c) {
        var x = c + 65536;
        x = x.toString(16);
        x = x.slice(1);
        var output = "\\u" + x.toUpperCase();
        return output;
    }
    function hexEscape(c) {
        var x = c + 256;
        x = x.toString(16);
        x = x.slice(1);
        var output = "\\x" + x.toUpperCase();
        return output;
    }
    function arrayEscapeJavaScript(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(escapeJavaScript(target[i]));
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setEscapeJavaScript(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(escapeJavaScript(target[k]));
                }
            }
        }
        return result;
    }
    function unescapeJavaScript(target) {
        var result = target;
        if (target !== null && typeof target !== "undefined") {
            result = unescapeJavaAny(target);
        }
        return result;
    }
    function unescapeJavaAny(target) {
        var result = "";
        var unicodeSpec = "";
        var unicodeLen = -1;
        var hexSpec = "";
        var hexLen = -1;
        var lastWasEscape = false;
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            var c = target.charAt(i);
            if (unicodeLen >= 0) {
                unicodeSpec += c;
                if (c >= "0" && c <= "9" || c >= "A" && c <= "F" || c >= "a" && c <= "f") {
                    unicodeLen++;
                    if (unicodeLen > 3) {
                        var cc = parseInt(unicodeSpec, 16);
                        c = String.fromCharCode(cc);
                        unicodeSpec = "";
                        unicodeLen = -1;
                        result += c;
                        lastWasEscape = false;
                    }
                } else {
                    return target;
                }
            } else if (hexLen >= 0) {
                hexSpec += c;
                if (c >= "0" && c <= "9" || c >= "A" && c <= "F" || c >= "a" && c <= "f") {
                    hexLen++;
                    if (hexLen > 1) {
                        var cc = parseInt(hexSpec, 16);
                        c = String.fromCharCode(cc);
                        hexSpec = "";
                        hexLen = -1;
                        result += c;
                        lastWasEscape = false;
                    }
                } else {
                    return target;
                }
            } else if (lastWasEscape) {
                if (c === "u") {
                    unicodeLen = 0;
                } else if (c === "x") {
                    hexLen = 0;
                } else {
                    switch (c) {
                      case "t":
                        c = "\t";
                        break;

                      case "n":
                        c = "\n";
                        break;

                      case "b":
                        c = "\b";
                        break;

                      case "f":
                        c = "\f";
                        break;

                      case "r":
                        c = "\r";
                        break;

                      default:
                        break;
                    }
                    result += c;
                    lastWasEscape = false;
                }
            } else if (c == "\\") {
                lastWasEscape = true;
            } else {
                result += c;
                lastWasEscape = false;
            }
        }
        if (unicodeLen >= 0) {
            result += "\\u" + unicodeSpec;
        } else if (hexLen >= 0) {
            result += "\\x" + hexSpec;
        } else if (lastWasEscape) {
            result += "\\";
        }
        return result;
    }
    function arrayUnescapeJavaScript(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(unescapeJavaScript(target[i]));
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setUnescapeJavaScript(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(unescapeJavaScript(target[k]));
                }
            }
        }
        return result;
    }
    function escapeJava(target) {
        var result = target;
        if (target !== null && typeof target !== "undefined") {
            result = escapeJavaAny(target, false);
        }
        return result;
    }
    function arrayEscapeJava(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = [];
            for (var i = 0, iLimit = target.length; i < iLimit; i++) {
                if (target[i] !== null) {
                    result.push(escapeJava(target[i]));
                } else {
                    result.push(null);
                }
            }
        }
        return result;
    }
    function setEscapeJava(target) {
        var result = null;
        if (target !== null && typeof target !== "undefined") {
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(escapeJava(target[k]));
                }
            }
        }
        return result;
    }
    var ALPHA_NUMERIC = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    function randomAlphanumeric(count) {
        var result = "";
        for (var i = 0; i < count; i++) {
            result += ALPHA_NUMERIC.charAt(Math.floor(Math.random() * ALPHA_NUMERIC.length));
        }
        return result;
    }
    function defaultString(target, defaultValue) {
        if (defaultValue !== null && typeof defaultValue !== "undefined") {
            if (target == null) {
                return defaultValue.toString();
            }
            var targetString = target.toString();
            if (isEmpty(targetString)) {
                return defaultValue.toString();
            }
            return targetString;
        }
        stringsError("defaultString defaultValue cannot be null", this);
    }
    function doArrayDefaultString(target, defaultValue) {
        if (target == null || typeof target === "undefined") {
            return target;
        }
        var result = [];
        for (var i = 0, iLimit = target.length; i < iLimit; i++) {
            result.push(defaultString(target[i], defaultValue));
        }
        return result;
    }
    function arrayDefaultString(target, defaultValue) {
        if (defaultValue !== null && typeof defaultValue !== "undefined") {
            return doArrayDefaultString(target, defaultValue);
        }
        stringsError("arrayDefaultString defaultValue cannot be null", this);
    }
    function listDefaultString(target, defaultValue) {
        if (defaultValue !== null && typeof defaultValue !== "undefined") {
            return doArrayDefaultString(target, defaultValue);
        }
        stringsError("listDefaultString defaultValue cannot be null", this);
    }
    function setDefaultString(target, defaultValue) {
        if (defaultValue !== null && typeof defaultValue !== "undefined") {
            if (target == null || typeof target === "undefined") {
                return target;
            }
            result = new thymol.ThSet();
            for (var k in target) {
                if (target.isContent(k)) {
                    result.add(defaultString(target[k], defaultValue));
                }
            }
            return result;
        }
        stringsError("setDefaultString defaultValue cannot be null", this);
    }
    function stringsError(text, element) {
        thymol.error(true, "#strings." + text, element);
    }
    return {
        thExpressionObjectName: thExpressionObjectName,
        toString: toString,
        arrayToString: arrayToString,
        listToString: arrayToString,
        setToString: setToString,
        abbreviate: abbreviate,
        arrayAbbreviate: arrayAbbreviate,
        listAbbreviate: arrayAbbreviate,
        setAbbreviate: setAbbreviate,
        equals: equals,
        equalsIgnoreCase: equalsIgnoreCase,
        contains: contains,
        arrayContains: arrayContains,
        listContains: arrayContains,
        setContains: setContains,
        containsIgnoreCase: containsIgnoreCase,
        arrayContainsIgnoreCase: arrayContainsIgnoreCase,
        listContainsIgnoreCase: arrayContainsIgnoreCase,
        setContainsIgnoreCase: setContainsIgnoreCase,
        startsWith: startsWith,
        arrayStartsWith: arrayStartsWith,
        listStartsWith: arrayStartsWith,
        setStartsWith: setStartsWith,
        endsWith: endsWith,
        arrayEndsWith: arrayEndsWith,
        listEndsWith: arrayEndsWith,
        setEndsWith: setEndsWith,
        substring: substring,
        arraySubstring: arraySubstring,
        listSubstring: arraySubstring,
        setSubstring: setSubstring,
        substringAfter: substringAfter,
        arraySubstringAfter: arraySubstringAfter,
        listSubstringAfter: arraySubstringAfter,
        setSubstringAfter: setSubstringAfter,
        substringBefore: substringBefore,
        arraySubstringBefore: arraySubstringBefore,
        listSubstringBefore: arraySubstringBefore,
        setSubstringBefore: setSubstringBefore,
        prepend: prepend,
        arrayPrepend: arrayPrepend,
        listPrepend: arrayPrepend,
        setPrepend: setPrepend,
        repeat: repeat,
        append: append,
        concat: concat,
        concatReplaceNulls: concatReplaceNulls,
        arrayAppend: arrayAppend,
        listAppend: arrayAppend,
        setAppend: setAppend,
        indexOf: indexOf,
        arrayIndexOf: arrayIndexOf,
        listIndexOf: arrayIndexOf,
        setIndexOf: setIndexOf,
        isEmpty: isEmpty,
        arrayIsEmpty: arrayIsEmpty,
        listIsEmpty: arrayIsEmpty,
        setIsEmpty: setIsEmpty,
        arrayJoin: arrayJoin,
        listJoin: arrayJoin,
        setJoin: setJoin,
        arraySplit: arraySplit,
        listSplit: arraySplit,
        setSplit: setSplit,
        length: length,
        arrayLength: arrayLength,
        listLength: arrayLength,
        setLength: setLength,
        replace: replace,
        arrayReplace: arrayReplace,
        listReplace: arrayReplace,
        setReplace: setReplace,
        multipleReplace: multipleReplace,
        arrayMultipleReplace: arrayMultipleReplace,
        listMultipleReplace: arrayMultipleReplace,
        setMultipleReplace: setMultipleReplace,
        toUpperCase: toUpperCase,
        arrayToUpperCase: arrayToUpperCase,
        listToUpperCase: arrayToUpperCase,
        setToUpperCase: setToUpperCase,
        toLowerCase: toLowerCase,
        arrayToLowerCase: arrayToLowerCase,
        listToLowerCase: arrayToLowerCase,
        setToLowerCase: setToLowerCase,
        trim: trim,
        arrayTrim: arrayTrim,
        listTrim: arrayTrim,
        setTrim: setTrim,
        capitalize: capitalize,
        arrayCapitalize: arrayCapitalize,
        listCapitalize: arrayCapitalize,
        setCapitalize: setCapitalize,
        unCapitalize: unCapitalize,
        arrayUnCapitalize: arrayUnCapitalize,
        listUnCapitalize: arrayUnCapitalize,
        setUnCapitalize: setUnCapitalize,
        capitalizeWords: capitalizeWords,
        arrayCapitalizeWords: arrayCapitalizeWords,
        listCapitalizeWords: arrayCapitalizeWords,
        setCapitalizeWords: setCapitalizeWords,
        escapeXml: escapeXml,
        arrayEscapeXml: arrayEscapeXml,
        listEscapeXml: arrayEscapeXml,
        setEscapeXml: setEscapeXml,
        escapeJavaScript: escapeJavaScript,
        arrayEscapeJavaScript: arrayEscapeJavaScript,
        listEscapeJavaScript: arrayEscapeJavaScript,
        setEscapeJavaScript: setEscapeJavaScript,
        unescapeJavaScript: unescapeJavaScript,
        arrayUnescapeJavaScript: arrayUnescapeJavaScript,
        listUnescapeJavaScript: arrayUnescapeJavaScript,
        setUnescapeJavaScript: setUnescapeJavaScript,
        escapeJava: escapeJava,
        arrayEscapeJava: arrayEscapeJava,
        listEscapeJava: arrayEscapeJava,
        setEscapeJava: setEscapeJava,
        unescapeJava: unescapeJavaScript,
        arrayUnescapeJava: arrayUnescapeJavaScript,
        listUnescapeJava: arrayUnescapeJavaScript,
        setUnescapeJava: setUnescapeJavaScript,
        randomAlphanumeric: randomAlphanumeric,
        defaultString: defaultString,
        arrayDefaultString: arrayDefaultString,
        listDefaultString: listDefaultString,
        setDefaultString: setDefaultString
    };
}();

thymol.thObjectsConfigureModules = function() {
    thymol.addDialect({
        objects: [ thymol.objects.thAggregatesObject, thymol.objects.thArraysObject, thymol.objects.thBoolsObject, thymol.objects.thDatesObject, thymol.objects.thCalendarsObject, thymol.objects.thIdsObject, thymol.objects.thListsObject, thymol.objects.thMapsObject, thymol.objects.thMessagesObject, thymol.objects.thNumbersObject, thymol.objects.thObjectsObject, thymol.objects.thSetsObject, thymol.objects.thStringsObject ]
    });
};

thymol.handleError = function(err) {
    var result = null;
    if (!err.suppress) {
        if (err.doThrow) {
            result = err;
        } else {
            thymol.alert(err);
        }
    }
    return result;
};

thymol.alert = function(err) {
    if (thymol.debug) {
        thymol.thWindow.alert(err.message);
    }
};

thymol.readFile = function(uri, report) {
    try {
        return thymol.fileSystem.readFileSync(uri, "UTF-8");
    } catch (err) {
        if (!!report) {
            thymol.error(true, "readFile failed for uri: " + uri, thymol.thDocument, err);
        }
    }
};

thymol.isServerSide = function() {
    return true;
};

exports.thymol = thymol;