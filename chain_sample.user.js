// ==UserScript==
// @name           chain_sample
// @namespace      gomaxfire.dnsdojo.com
// @require       http://jqueryjs.googlecode.com/files/jquery-1.2.6.js
// @require       http://github.com/gotin/chain/tree/master%2Fchain.js?raw=true
// @include        *
// ==/UserScript==
if(window.parent==window){

  function log(s){console.log(s);};

  var test = function(){
    $C(function main(){
         log("start request to get existing file");
         $C.xhr("http://gomaxfire.dnsdojo.com/jsrails/data.txt")
         (
           $C.ok(
             function(html){
               console.log("(ok!)");
               log(html);
             }
           )
         )(
           $C.error(function(e){
                      log("(error)");
                      log(e.options.url);
                      return "error";
                    })
         )(
           $C.wait()
         )(
           function sub(){
             log("start request to get unexisting file");
             $C.xhr("http://ggomaxfire.dnsdojo.com/not_found_text.txt")
             (
               $C.ok(function(txt){
                       log("(ok!)");
                       log(txt);
                     })
             )(
               $C.error(function(e){
                          log("(error)");
                          log(e.options.url);
                          return "error";
                        })

             )();
           } // sub
         )(
           function finish(a){
             log(a);
             log("end");
           } // finish
         )();
       } // main
      )();
  };


  // for_loop test
  //
  //$C.for_loop(function(){this.i=0},         // initialize
  //       function(){return this.i<3;}, // condition
  //       function(){this.i++;})        // increment
  // (test) // loop body
  // (function(){log("finish")})   // execute function after loop finishing
  // ();                                 // call chain

  // loop test
  //
//  $C.loop(3, 1000, test)        // 3times loop with 1000ms wait
//  (function(){log("finish.");})();

  // loop test without wait time
  //

  $C.loop(3, test)  // 3times loop with 0ms wait
  (function(){log("finish.");})();


  //jQuery test
  //
  //console.log($("a").attr("href"));
  //$("a").attr("href","http://www.google.com");
  //console.log($("a").attr("href"));
  //$.get("http://d.hatena.ne.jp/gotin/",function(html){console.log(html);});

  //event test
  var $C2 = $C.create();
  $C2.loop(10,
           function(){
             $C2.event(document.body, "click")        // event driven chain
             (
               function (e){ // event call back
                 log("[click!!]");
                 $C2(new Date().getTime())
                 (
                   $C2.cond(function(n){return n%2==0;},             // condition
                            function(){console.log("[even]");})      // action when condtion becomes true
                 )();
               } // event call back
             )();
           }
          )(
            function(){  // function after finishing loop
              log("10 times click");
            }
          )();

}
