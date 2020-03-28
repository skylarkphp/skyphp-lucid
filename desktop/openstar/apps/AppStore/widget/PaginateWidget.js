define([
  "dojo/dom",
  "dojo/on",
  "dojo/request",
  "dojo/html",
  "dojo/dom-construct",
  "dojo/dom-attr",
  "dojo/_base/array",
  'dojo/_base/json',
  "dojo/_base/lang",
  "dojo/_base/declare",
  "dojo/dom-style",
  "dojo/dom-class",
  "dojo/query",
  "dojo/aspect",
  "dojo/store/Memory",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./templates/paginate.html"
],function(dom,on,request,html,domConstruct,domAttr,array,dJson,lang,declare,domStyle,domClass,query,aspect,Memory,WidgetBase,TemplatedMixin,
  _WidgetsInTemplateMixin,template){

  return declare([WidgetBase, TemplatedMixin,_WidgetsInTemplateMixin], {
    templateString: template,
    sortObj:{}, //{"download_count":"热门","updated_at":"最新","fav_count":"推荐","view_count":"免费","version":"限免","app_id":"收费"}
    sortName: 'name',
    sortCons: {descending:false},
    baseData: [],
    perPage: 3,
    pgCursor: 4, // when to change page nav num
    pgLeftShowCt: 3, 
    pgRightShowCt: 3,
    pgShowCt: 7, // the size of nav bar page item
    pageSize: 0,
    firstPgNum: 1,
    lastPgNum: 7,
    currentPgNum: 1,
    pages: [],
    showPages: [],
    pageANodes: {},
    baseClass: "pagination",

    postCreate: function(){
      this._createSortCnt();
      this._gotPageItems();
      this._createPageCnt(this.pages[0]);
      this._createPageNavCnt();
      // this._addPaginationAfterEvent();
      this.inherited(arguments);
    },

    _createSortCnt: function(){
      var self = this;
      var UlNode = domConstruct.create("ul",{},this.sortCnt);
      var sortObj = this.sortObj;
      for(var key in sortObj){
        var className = key === "download_count" ? (key + " currentSort") : key;
        var liNode = domConstruct.create("li",{},UlNode);
        var aNode = domConstruct.create("a",{
          href:"javascript:void(0);",
          "class": className,
          innerHTML:sortObj[key],
          onclick: function(){
            query(".currentSort").removeClass("currentSort");
            // domConstruct.empty(self.id);
            self._gotPageItems(this.className);
            self._createPageCnt(self.pages[0]);
            query("." + this.className).addClass("currentSort");
            // self._createPageNavCnt();
          }
        },liNode);
      }
    },

    _createPageCnt: function(page){
      domConstruct.empty(this.pageCnt);
      array.forEach(page,lang.hitch(this,function(p,index){
        var colorClass = index % 2 === 0 ? "evenItem" : "oddItem";
        var itemDiv = domConstruct.create("div",{"class": colorClass},this.pageCnt);
        itemDiv.appendChild(p.domNode);
      }));
    },

    _createPageNavCnt: function(){
      if(this.pageSize <= this.currentPgNum) return;
      var self = this;
      // previous page
      domConstruct.create("a",{
        "class":"prevPg pg",
        "id":"prevPg",
        innerHTML: "Previous",
        style:"display:none",
        href:"javascript:void(0);",
        onclick: function(){
          if(self.currentPgNum > 1){
            query(".cntPg").removeClass("cntPg");
            domClass.add("pg" + (self.currentPgNum - 1),"cntPg");
            self.currentPgNum -= 1; 
            self.goToPage(self.currentPgNum);
          }
        }
      },self.pageNavCnt);

      self._createFirstPage();

      self._createPageNavItem();

      self._createLastPage();

      // next page
      domConstruct.create("a",{
        "class":"nextPg pg",
        "id":"nextPg",
        innerHTML: "Next",
        href:"javascript:void(0);",
        onclick: function(){
          if(self.currentPgNum < self.pageSize){
            query(".cntPg").removeClass("cntPg");
            domClass.add(dom.byId("pg" + (self.currentPgNum + 1)),"cntPg");
            self.currentPgNum += 1; 
            self.goToPage(self.currentPgNum);
          }
        }
      },self.pageNavCnt);
    },

    _createFirstPage: function(){
      // firstPage
      var self = this;
      var firstPgDiv = domConstruct.create("div",{style:"display:none","class":"firstPg"},self.pageNavCnt);
      domConstruct.create("a",{
        id:"firstPg",
        "class":"pg",
        innerHTML: 1,
        href:"javascript:void(0);",
        onclick: function(){
          query(".cntPg").removeClass("cntPg");
          domClass.add(dom.byId("pg1"),"cntPg");
          query(".showPg").forEach(function(aNode){
            var pgId = "pg" + parseInt(aNode.text);
            domStyle.set(dom.byId(pgId),"display","none");
            domClass.remove(pgId,"showPg");
          })
          for(i=1;i<=self.pgShowCt;i++){
            var pgId = "pg" + i;
            domClass.add(pgId,"showPg");
            domStyle.set(dom.byId(pgId),"display","inline-block");
          }
          self.currentPgNum = 1; 
          self.goToPage(1);
          query(".firstPg").style("display","none");
          if(self.pageSize > self.pgShowCt)
            query(".lastPg").style("display","inline-block");
        }
      },firstPgDiv);
      domConstruct.create("span",{"class":"otherPg",innerHTML:"..."},firstPgDiv);
      
    },

    _createLastPage: function(){
       // lastPage
      var self = this;
      var lastPgDiv = domConstruct.create("div",{style:"display:inline-block","class":"lastPg"},self.pageNavCnt);
      domConstruct.create("span",{"class":"otherPg",innerHTML:"..."},lastPgDiv);
      domConstruct.create("a",{
        id:"lastPg",
        "class":"pg",
        innerHTML: self.pageSize,
        href:"javascript:void(0);",
        onclick: function(){
          query(".cntPg").removeClass("cntPg");
          domClass.add(dom.byId("pg" + self.pageSize),"cntPg");
          query(".showPg").forEach(function(aNode){
            var pgId = "pg" + parseInt(aNode.text);
            domStyle.set(dom.byId(pgId),"display","none");
            domClass.remove(pgId,"showPg");
          })
          for(i=self.pageSize - self.pgShowCt +1;i<=self.pageSize;i++){
            var pgId = "pg" + i;
            domClass.add(pgId,"showPg");
            domStyle.set(dom.byId(pgId),"display","inline-block");
          }
          query(".lastPg").style("display","none");
          if(self.pageSize > self.pgShowCt)
            query(".firstPg").style("display","inline-block");
          self.currentPgNum = self.pageSize; 
          self.goToPage(self.pageSize);
        }
      },lastPgDiv);
     
    },

    _createPageNavItem: function(){
      var self = this;
      for(var i=1; i<=self.pageSize;i++){
        if(i<=self.pgShowCt){
          var className = i === 1 ? "cntPg pg" : "pg";
          var aShowStyle = "display:inline-block" 
          className += " showPg";
        } else{
          var className = "pg";
          var aShowStyle = "display:none";
        }
        self.pageANodes[i] = domConstruct.create("a",{
          "class": className,
          id:"pg" + i,
          innerHTML: i,
          style:aShowStyle,
          href:"javascript:void(0);",
          onclick: function(){
            query(".cntPg").removeClass("cntPg");
            domClass.add(this,"cntPg");
            var pgNum = parseInt(this.text);
            self.goToPage(pgNum);
            self.currentPgNum = pgNum;
   
            var prevShowStyle = self.currentPgNum === 1 ? "none" : "inline";
            domStyle.set(dom.byId("prevPg"),"display",prevShowStyle);

            var nextShowStyle = self.currentPgNum === self.pageSize ? "none" : "inline";
            domStyle.set(dom.byId("nextPg"),"display",nextShowStyle);
            self._addPaginationAfterEvent(pgNum);
          }
        },self.pageNavCnt);
      }
    },

    _addPaginationAfterEvent: function(currentPg){
      // query("a.pg").forEach(function(paNode){
      //   aspect.after(paNode,"onclick",function(){
      //     alert(11);
      //   });
      // });
      var self = this;
      query(".showPg").forEach(function(aNode,index){
        var pgNum = parseInt(aNode.text);
        // init first page num and page cursor num 
        if(index === 0){
          self.firstPgNum = pgNum;
          self.pgCursor = pgNum + self.pgLeftShowCt;
          self.lastPgNum = self.firstPgNum + self.pgShowCt - 1;
        }
      });

      // click cursor after node 
      if(currentPg > self.pgCursor){

        var afterLastPgNum = self.pgRightShowCt + currentPg; // 2 + 4 = 6
        if(afterLastPgNum >= self.pageSize) afterLastPgNum = self.pageSize;

        //show first page
        if(self.pgShowCt < self.pageSize)
          query(".firstPg").style("display","inline-block");

        //show last page
        if(afterLastPgNum < self.pageSize) //eg: 8 - 2 = 6; 4,5 show 
          query(".lastPg").style("display","inline-block");
        else 
          query(".lastPg").style("display","none");

        // show after pages
        for(i=self.pgCursor+self.pgRightShowCt + 1; i<=afterLastPgNum;i++){ // 3 + 2 + 1 begin in 6
          var pgId = "pg" + i;
          domClass.add(pgId,"showPg");
          domStyle.set(dom.byId(pgId),"display","inline-block");
        }

        // hidden before pages
        var beforeFirstPgNum = afterLastPgNum - self.pgShowCt; // 7-5 =2
        for(i=1; i<=beforeFirstPgNum;i++){ // hidden 1 page
          var pgId = "pg" + i;
          domClass.remove(pgId,"showPg");
          domStyle.set(dom.byId(pgId),"display","none");
        }
      } else {
        // show last page
        if(self.pgShowCt < self.pageSize)
          query(".lastPg").style("display","inline-block");
        if(self.firstPgNum > 1){
          // hidden after pages
          var afterLastPgNum = currentPg + self.pgRightShowCt + 1;
          for(i=afterLastPgNum; i<=self.lastPgNum; i++){
            var pgId = "pg" + i;
            domClass.remove(pgId,"showPg");
            domStyle.set(dom.byId(pgId),"display","none");
          }

          // show before pages
          var beforeFirstPgNum = currentPg - self.pgLeftShowCt;
          // show first page
          if(beforeFirstPgNum > 1)
            query(".firstPg").style("display","inline-block");
          else
            query(".firstPg").style("display","none");
          
          for(i=beforeFirstPgNum; i<self.firstPgNum; i++){
            var pgId = "pg" + i;
            domClass.add(pgId,"showPg");
            domStyle.set(dom.byId(pgId),"display","inline-block");
          }
        } else {
          query(".firstPg").style("display","none");
        }
      }
    },

    _gotPageItems: function(sortName){
      var pageData = this.doSort(sortName);
      var pages = this.pages = [];
      var length = pageData.length;
      var leaveCount = length % this.perPage;
      var pageSize = this.pageSize = Math.ceil(length / this.perPage);

      array.forEach(pageData,lang.hitch(this,function(data,index){
        if((index +1) % this.perPage === 0 ){
          var siglePg = [];
          for(i=0;i<this.perPage;i++){
            siglePg.push(pageData[index-i]);
          }
          // pages.push([pageData[index-2],pageData[index-1],pageData[index]]);
          pages.push(siglePg);
        }
      }));

      if(leaveCount > 0){
        var lastPage = [];
        for(var i = (pageSize-1) * this.perPage; i < length; i++){
          lastPage.push(pageData[i]);
        }
        pages.push(lastPage);
      }
    },

    nextPage: function(){
      var page = this.pages[currentPgNum - 2];
      this._createPageCnt(page);
    },

    previousPage: function(){
      var page = this.pages[currentPgNum];
      this._createPageCnt(page);
    },

    goToPage: function(pageNum){
      var page = this.pages[pageNum-1];
      this._createPageCnt(page);
    },

    doSort: function(sortName){
      sortName = sortName || this.sortName
      var store = new Memory({data:this.baseData});
      return store.query({},{sort:[lang.mixin({attribute:sortName},this.sortCons)]});
    }
  });

})