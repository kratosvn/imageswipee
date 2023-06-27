function createElement(className,tagName,appendToEl){const el=document.createElement(tagName);if(className){el.className=className}if(appendToEl){appendToEl.appendChild(el)}return el}function toTransformString(x,y,scale){let propValue=`translate3d(${x}px,${y||0}px,0)`;if(scale!==undefined){propValue+=` scale3d(${scale},${scale},1)`}return propValue}function setWidthHeight(el,w,h){el.style.width=typeof w==="number"?`${w}px`:w;el.style.height=typeof h==="number"?`${h}px`:h}const LOAD_STATE={IDLE:"idle",LOADING:"loading",LOADED:"loaded",ERROR:"error"};function specialKeyUsed(e){return"button"in e&&e.button===1||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey}function getElementsFromOption(option,legacySelector,parent=document){let elements=[];if(option instanceof Element){elements=[option]}else if(option instanceof NodeList||Array.isArray(option)){elements=Array.from(option)}else{const selector=typeof option==="string"?option:legacySelector;if(selector){elements=Array.from(parent.querySelectorAll(selector))}}return elements}function isPswpClass(fn){return typeof fn==="function"&&fn.prototype&&fn.prototype.goTo}function isSafari(){return!!(navigator.vendor&&navigator.vendor.match(/apple/i))}class PhotoSwipeEvent{constructor(type,details){this.type=type;this.defaultPrevented=false;if(details){Object.assign(this,details)}}preventDefault(){this.defaultPrevented=true}}class Eventable{constructor(){this._listeners={};this._filters={};this.pswp=undefined;this.options=undefined}addFilter(name,fn,priority=100){if(!this._filters[name]){this._filters[name]=[]}this._filters[name]?.push({fn:fn,priority:priority});this._filters[name]?.sort((f1,f2)=>f1.priority-f2.priority);this.pswp?.addFilter(name,fn,priority)}removeFilter(name,fn){if(this._filters[name]){this._filters[name]=this._filters[name].filter(filter=>filter.fn!==fn)}if(this.pswp){this.pswp.removeFilter(name,fn)}}applyFilters(name,...args){this._filters[name]?.forEach(filter=>{args[0]=filter.fn.apply(this,args)});return args[0]}on(name,fn){if(!this._listeners[name]){this._listeners[name]=[]}this._listeners[name]?.push(fn);this.pswp?.on(name,fn)}off(name,fn){if(this._listeners[name]){this._listeners[name]=this._listeners[name].filter(listener=>fn!==listener)}this.pswp?.off(name,fn)}dispatch(name,details){if(this.pswp){return this.pswp.dispatch(name,details)}const event=new PhotoSwipeEvent(name,details);this._listeners[name]?.forEach(listener=>{listener.call(this,event)});return event}}class Placeholder{constructor(imageSrc,container){this.element=createElement("pswp__img pswp__img--placeholder",imageSrc?"img":"div",container);if(imageSrc){const imgEl=this.element;imgEl.decoding="async";imgEl.alt="";imgEl.src=imageSrc;imgEl.setAttribute("role","presentation")}this.element.setAttribute("aria-hidden","true")}setDisplayedSize(width,height){if(!this.element){return}if(this.element.tagName==="IMG"){setWidthHeight(this.element,250,"auto");this.element.style.transformOrigin="0 0";this.element.style.transform=toTransformString(0,0,width/250)}else{setWidthHeight(this.element,width,height)}}destroy(){if(this.element?.parentNode){this.element.remove()}this.element=null}}class Content{constructor(itemData,instance,index){this.instance=instance;this.data=itemData;this.index=index;this.element=undefined;this.placeholder=undefined;this.slide=undefined;this.displayedImageWidth=0;this.displayedImageHeight=0;this.width=Number(this.data.w)||Number(this.data.width)||0;this.height=Number(this.data.h)||Number(this.data.height)||0;this.isAttached=false;this.hasSlide=false;this.isDecoding=false;this.state=LOAD_STATE.IDLE;if(this.data.type){this.type=this.data.type}else if(this.data.src){this.type="image"}else{this.type="html"}this.instance.dispatch("contentInit",{content:this})}removePlaceholder(){if(this.placeholder&&!this.keepPlaceholder()){setTimeout(()=>{if(this.placeholder){this.placeholder.destroy();this.placeholder=undefined}},1e3)}}load(isLazy,reload){if(this.slide&&this.usePlaceholder()){if(!this.placeholder){const placeholderSrc=this.instance.applyFilters("placeholderSrc",this.data.msrc&&this.slide.isFirstSlide?this.data.msrc:false,this);this.placeholder=new Placeholder(placeholderSrc,this.slide.container)}else{const placeholderEl=this.placeholder.element;if(placeholderEl&&!placeholderEl.parentElement){this.slide.container.prepend(placeholderEl)}}}if(this.element&&!reload){return}if(this.instance.dispatch("contentLoad",{content:this,isLazy:isLazy}).defaultPrevented){return}if(this.isImageContent()){this.element=createElement("pswp__img","img");if(this.displayedImageWidth){this.loadImage(isLazy)}}else{this.element=createElement("pswp__content","div");this.element.innerHTML=this.data.html||""}if(reload&&this.slide){this.slide.updateContentSize(true)}}loadImage(isLazy){if(!this.isImageContent()||!this.element||this.instance.dispatch("contentLoadImage",{content:this,isLazy:isLazy}).defaultPrevented){return}const imageElement=this.element;this.updateSrcsetSizes();if(this.data.srcset){imageElement.srcset=this.data.srcset}imageElement.src=this.data.src??"";imageElement.alt=this.data.alt??"";this.state=LOAD_STATE.LOADING;if(imageElement.complete){this.onLoaded()}else{imageElement.onload=()=>{this.onLoaded()};imageElement.onerror=()=>{this.onError()}}}setSlide(slide){this.slide=slide;this.hasSlide=true;this.instance=slide.pswp}onLoaded(){this.state=LOAD_STATE.LOADED;if(this.slide&&this.element){this.instance.dispatch("loadComplete",{slide:this.slide,content:this});if(this.slide.isActive&&this.slide.heavyAppended&&!this.element.parentNode){this.append();this.slide.updateContentSize(true)}if(this.state===LOAD_STATE.LOADED||this.state===LOAD_STATE.ERROR){this.removePlaceholder()}}}onError(){this.state=LOAD_STATE.ERROR;if(this.slide){this.displayError();this.instance.dispatch("loadComplete",{slide:this.slide,isError:true,content:this});this.instance.dispatch("loadError",{slide:this.slide,content:this})}}isLoading(){return this.instance.applyFilters("isContentLoading",this.state===LOAD_STATE.LOADING,this)}isError(){return this.state===LOAD_STATE.ERROR}isImageContent(){return this.type==="image"}setDisplayedSize(width,height){if(!this.element){return}if(this.placeholder){this.placeholder.setDisplayedSize(width,height)}if(this.instance.dispatch("contentResize",{content:this,width:width,height:height}).defaultPrevented){return}setWidthHeight(this.element,width,height);if(this.isImageContent()&&!this.isError()){const isInitialSizeUpdate=!this.displayedImageWidth&&width;this.displayedImageWidth=width;this.displayedImageHeight=height;if(isInitialSizeUpdate){this.loadImage(false)}else{this.updateSrcsetSizes()}if(this.slide){this.instance.dispatch("imageSizeChange",{slide:this.slide,width:width,height:height,content:this})}}}isZoomable(){return this.instance.applyFilters("isContentZoomable",this.isImageContent()&&this.state!==LOAD_STATE.ERROR,this)}updateSrcsetSizes(){if(!this.isImageContent()||!this.element||!this.data.srcset){return}const image=this.element;const sizesWidth=this.instance.applyFilters("srcsetSizesWidth",this.displayedImageWidth,this);if(!image.dataset.largestUsedSize||sizesWidth>parseInt(image.dataset.largestUsedSize,10)){image.sizes=sizesWidth+"px";image.dataset.largestUsedSize=String(sizesWidth)}}usePlaceholder(){return this.instance.applyFilters("useContentPlaceholder",this.isImageContent(),this)}lazyLoad(){if(this.instance.dispatch("contentLazyLoad",{content:this}).defaultPrevented){return}this.load(true)}keepPlaceholder(){return this.instance.applyFilters("isKeepingPlaceholder",this.isLoading(),this)}destroy(){this.hasSlide=false;this.slide=undefined;if(this.instance.dispatch("contentDestroy",{content:this}).defaultPrevented){return}this.remove();if(this.placeholder){this.placeholder.destroy();this.placeholder=undefined}if(this.isImageContent()&&this.element){this.element.onload=null;this.element.onerror=null;this.element=undefined}}displayError(){if(this.slide){let errorMsgEl=createElement("pswp__error-msg","div");errorMsgEl.innerText=this.instance.options?.errorMsg??"";errorMsgEl=this.instance.applyFilters("contentErrorElement",errorMsgEl,this);this.element=createElement("pswp__content pswp__error-msg-container","div");this.element.appendChild(errorMsgEl);this.slide.container.innerText="";this.slide.container.appendChild(this.element);this.slide.updateContentSize(true);this.removePlaceholder()}}append(){if(this.isAttached||!this.element){return}this.isAttached=true;if(this.state===LOAD_STATE.ERROR){this.displayError();return}if(this.instance.dispatch("contentAppend",{content:this}).defaultPrevented){return}const supportsDecode="decode"in this.element;if(this.isImageContent()){if(supportsDecode&&this.slide&&(!this.slide.isActive||isSafari())){this.isDecoding=true;this.element.decode().catch(()=>{}).finally(()=>{this.isDecoding=false;this.appendImage()})}else{this.appendImage()}}else if(this.slide&&!this.element.parentNode){this.slide.container.appendChild(this.element)}}activate(){if(this.instance.dispatch("contentActivate",{content:this}).defaultPrevented||!this.slide){return}if(this.isImageContent()&&this.isDecoding&&!isSafari()){this.appendImage()}else if(this.isError()){this.load(false,true)}if(this.slide.holderElement){this.slide.holderElement.setAttribute("aria-hidden","false")}}deactivate(){this.instance.dispatch("contentDeactivate",{content:this});if(this.slide&&this.slide.holderElement){this.slide.holderElement.setAttribute("aria-hidden","true")}}remove(){this.isAttached=false;if(this.instance.dispatch("contentRemove",{content:this}).defaultPrevented){return}if(this.element&&this.element.parentNode){this.element.remove()}if(this.placeholder&&this.placeholder.element){this.placeholder.element.remove()}}appendImage(){if(!this.isAttached){return}if(this.instance.dispatch("contentAppendImage",{content:this}).defaultPrevented){return}if(this.slide&&this.element&&!this.element.parentNode){this.slide.container.appendChild(this.element)}if(this.state===LOAD_STATE.LOADED||this.state===LOAD_STATE.ERROR){this.removePlaceholder()}}}function getViewportSize(options,pswp){if(options.getViewportSizeFn){const newViewportSize=options.getViewportSizeFn(options,pswp);if(newViewportSize){return newViewportSize}}return{x:document.documentElement.clientWidth,y:window.innerHeight}}function parsePaddingOption(prop,options,viewportSize,itemData,index){let paddingValue=0;if(options.paddingFn){paddingValue=options.paddingFn(viewportSize,itemData,index)[prop]}else if(options.padding){paddingValue=options.padding[prop]}else{const legacyPropName="padding"+prop[0].toUpperCase()+prop.slice(1);if(options[legacyPropName]){paddingValue=options[legacyPropName]}}return Number(paddingValue)||0}function getPanAreaSize(options,viewportSize,itemData,index){return{x:viewportSize.x-parsePaddingOption("left",options,viewportSize,itemData,index)-parsePaddingOption("right",options,viewportSize,itemData,index),y:viewportSize.y-parsePaddingOption("top",options,viewportSize,itemData,index)-parsePaddingOption("bottom",options,viewportSize,itemData,index)}}const MAX_IMAGE_WIDTH=4e3;class ZoomLevel{constructor(options,itemData,index,pswp){this.pswp=pswp;this.options=options;this.itemData=itemData;this.index=index;this.panAreaSize=null;this.elementSize=null;this.fit=1;this.fill=1;this.vFill=1;this.initial=1;this.secondary=1;this.max=1;this.min=1}update(maxWidth,maxHeight,panAreaSize){const elementSize={x:maxWidth,y:maxHeight};this.elementSize=elementSize;this.panAreaSize=panAreaSize;const hRatio=panAreaSize.x/elementSize.x;const vRatio=panAreaSize.y/elementSize.y;this.fit=Math.min(1,hRatio<vRatio?hRatio:vRatio);this.fill=Math.min(1,hRatio>vRatio?hRatio:vRatio);this.vFill=Math.min(1,vRatio);this.initial=this._getInitial();this.secondary=this._getSecondary();this.max=Math.max(this.initial,this.secondary,this._getMax());this.min=Math.min(this.fit,this.initial,this.secondary);if(this.pswp){this.pswp.dispatch("zoomLevelsUpdate",{zoomLevels:this,slideData:this.itemData})}}_parseZoomLevelOption(optionPrefix){const optionName=optionPrefix+"ZoomLevel";const optionValue=this.options[optionName];if(!optionValue){return}if(typeof optionValue==="function"){return optionValue(this)}if(optionValue==="fill"){return this.fill}if(optionValue==="fit"){return this.fit}return Number(optionValue)}_getSecondary(){let currZoomLevel=this._parseZoomLevelOption("secondary");if(currZoomLevel){return currZoomLevel}currZoomLevel=Math.min(1,this.fit*3);if(this.elementSize&&currZoomLevel*this.elementSize.x>MAX_IMAGE_WIDTH){currZoomLevel=MAX_IMAGE_WIDTH/this.elementSize.x}return currZoomLevel}_getInitial(){return this._parseZoomLevelOption("initial")||this.fit}_getMax(){return this._parseZoomLevelOption("max")||Math.max(1,this.fit*4)}}function lazyLoadData(itemData,instance,index){const content=instance.createContentFromData(itemData,index);let zoomLevel;const{options}=instance;if(options){zoomLevel=new ZoomLevel(options,itemData,-1);let viewportSize;if(instance.pswp){viewportSize=instance.pswp.viewportSize}else{viewportSize=getViewportSize(options,instance)}const panAreaSize=getPanAreaSize(options,viewportSize,itemData,index);zoomLevel.update(content.width,content.height,panAreaSize)}content.lazyLoad();if(zoomLevel){content.setDisplayedSize(Math.ceil(content.width*zoomLevel.initial),Math.ceil(content.height*zoomLevel.initial))}return content}function lazyLoadSlide(index,instance){const itemData=instance.getItemData(index);if(instance.dispatch("lazyLoadSlide",{index:index,itemData:itemData}).defaultPrevented){return}return lazyLoadData(itemData,instance,index)}class PhotoSwipeBase extends Eventable{getNumItems(){let numItems=0;const dataSource=this.options?.dataSource;if(dataSource&&"length"in dataSource){numItems=dataSource.length}else if(dataSource&&"gallery"in dataSource){if(!dataSource.items){dataSource.items=this._getGalleryDOMElements(dataSource.gallery)}if(dataSource.items){numItems=dataSource.items.length}}const event=this.dispatch("numItems",{dataSource:dataSource,numItems:numItems});return this.applyFilters("numItems",event.numItems,dataSource)}createContentFromData(slideData,index){return new Content(slideData,this,index)}getItemData(index){const dataSource=this.options?.dataSource;let dataSourceItem={};if(Array.isArray(dataSource)){dataSourceItem=dataSource[index]}else if(dataSource&&"gallery"in dataSource){if(!dataSource.items){dataSource.items=this._getGalleryDOMElements(dataSource.gallery)}dataSourceItem=dataSource.items[index]}let itemData=dataSourceItem;if(itemData instanceof Element){itemData=this._domElementToItemData(itemData)}const event=this.dispatch("itemData",{itemData:itemData||{},index:index});return this.applyFilters("itemData",event.itemData,index)}_getGalleryDOMElements(galleryElement){if(this.options?.children||this.options?.childSelector){return getElementsFromOption(this.options.children,this.options.childSelector,galleryElement)||[]}return[galleryElement]}_domElementToItemData(element){const itemData={element:element};const linkEl=element.tagName==="A"?element:element.querySelector("a");if(linkEl){itemData.src=linkEl.dataset.pswpSrc||linkEl.href;if(linkEl.dataset.pswpSrcset){itemData.srcset=linkEl.dataset.pswpSrcset}itemData.width=linkEl.dataset.pswpWidth?parseInt(linkEl.dataset.pswpWidth,10):0;itemData.height=linkEl.dataset.pswpHeight?parseInt(linkEl.dataset.pswpHeight,10):0;itemData.w=itemData.width;itemData.h=itemData.height;if(linkEl.dataset.pswpType){itemData.type=linkEl.dataset.pswpType}const thumbnailEl=element.querySelector("img");if(thumbnailEl){itemData.msrc=thumbnailEl.currentSrc||thumbnailEl.src;itemData.alt=thumbnailEl.getAttribute("alt")??""}if(linkEl.dataset.pswpCropped||linkEl.dataset.cropped){itemData.thumbCropped=true}}return this.applyFilters("domItemData",itemData,element,linkEl)}lazyLoadData(itemData,index){return lazyLoadData(itemData,this,index)}}class PhotoSwipeLightbox extends PhotoSwipeBase{constructor(options){super();this.options=options||{};this._uid=0;this.shouldOpen=false;this._preloadedContent=undefined;this.onThumbnailsClick=this.onThumbnailsClick.bind(this)}init(){getElementsFromOption(this.options.gallery,this.options.gallerySelector).forEach(galleryElement=>{galleryElement.addEventListener("click",this.onThumbnailsClick,false)})}onThumbnailsClick(e){if(specialKeyUsed(e)||window.pswp||window.navigator.onLine===false){return}let initialPoint={x:e.clientX,y:e.clientY};if(!initialPoint.x&&!initialPoint.y){initialPoint=null}let clickedIndex=this.getClickedIndex(e);clickedIndex=this.applyFilters("clickedIndex",clickedIndex,e,this);const dataSource={gallery:e.currentTarget};if(clickedIndex>=0){e.preventDefault();this.loadAndOpen(clickedIndex,dataSource,initialPoint)}}getClickedIndex(e){if(this.options.getClickedIndexFn){return this.options.getClickedIndexFn.call(this,e)}const clickedTarget=e.target;const childElements=getElementsFromOption(this.options.children,this.options.childSelector,e.currentTarget);const clickedChildIndex=childElements.findIndex(child=>child===clickedTarget||child.contains(clickedTarget));if(clickedChildIndex!==-1){return clickedChildIndex}else if(this.options.children||this.options.childSelector){return-1}return 0}loadAndOpen(index,dataSource,initialPoint){if(window.pswp){return false}this.options.index=index;this.options.initialPointerPos=initialPoint;this.shouldOpen=true;this.preload(index,dataSource);return true}preload(index,dataSource){const{options}=this;if(dataSource){options.dataSource=dataSource}const promiseArray=[];const pswpModuleType=typeof options.pswpModule;if(isPswpClass(options.pswpModule)){promiseArray.push(Promise.resolve(options.pswpModule))}else if(pswpModuleType==="string"){throw new Error("pswpModule as string is no longer supported")}else if(pswpModuleType==="function"){promiseArray.push(options.pswpModule())}else{throw new Error("pswpModule is not valid")}if(typeof options.openPromise==="function"){promiseArray.push(options.openPromise())}if(options.preloadFirstSlide!==false&&index>=0){this._preloadedContent=lazyLoadSlide(index,this)}const uid=++this._uid;Promise.all(promiseArray).then(iterableModules=>{if(this.shouldOpen){const mainModule=iterableModules[0];this._openPhotoswipe(mainModule,uid)}})}_openPhotoswipe(module,uid){if(uid!==this._uid&&this.shouldOpen){return}this.shouldOpen=false;if(window.pswp){return}const pswp=typeof module==="object"?new module.default(this.options):new module(this.options);this.pswp=pswp;window.pswp=pswp;Object.keys(this._listeners).forEach(name=>{this._listeners[name]?.forEach(fn=>{pswp.on(name,fn)})});Object.keys(this._filters).forEach(name=>{this._filters[name]?.forEach(filter=>{pswp.addFilter(name,filter.fn,filter.priority)})});if(this._preloadedContent){pswp.contentLoader.addToCache(this._preloadedContent);this._preloadedContent=undefined}pswp.on("destroy",()=>{this.pswp=undefined;delete window.pswp});pswp.init()}destroy(){this.pswp?.destroy();this.shouldOpen=false;this._listeners={};getElementsFromOption(this.options.gallery,this.options.gallerySelector).forEach(galleryElement=>{galleryElement.removeEventListener("click",this.onThumbnailsClick,false)})}}export{PhotoSwipeLightbox as default};