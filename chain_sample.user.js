// ==UserScript==
// @name           chain_sample
// @namespace      gomaxfire.dnsdojo.com
// @require       http://jqueryjs.googlecode.com/files/jquery-1.3.2.js
// @require       http://github.com/gotin/chain/tree/master/chain.js?raw=true
// @include        *
// ==/UserScript==
if(window.parent==window){
  function log(s){console.log(s);};


  var test = function(){
    $C(function main(){
         log("start request to get existing file");
         $C.xhr("http://github.com/gotin/chain/raw/65864d6430feab097fe7753248998f23f5fdefe5/README")
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
             $C.xhr("http://gomaxfire.dnsdojo.com/jsrails/data.txt_not_found")
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


  //event test
  (function(){
     var count = 0;
     var $C2 = $C.create();
     $C2.loop(10,
              function(){
                log(++count);
                $C2.event(document.body, "click")  // event driven chain
                (function (e){ // event call back
                   log("[click!!]"+count);
                   $C2(new Date().getTime())
                   (
                     $C2.cond(function(n){return n%2==0;},  // condition
                              function(){log("[even]");})   // action when condtion becomes true
                   )();
                 }); // event call back
              }
             )(
               function(){  // function after finishing loop
                 log("10 times click");
               }
             )();
   })();



  // pararell test
  var $C3 = $C.create();
  $C3.para([
             function(){
               log("para1:");
               $C.xhr("http://github.com/gotin/chain/raw/65864d6430feab097fe7753248998f23f5fdefe5/README")
               (
                 $C.ok(
                   function(html){
                     log("(ok!)");
                     return html;
                   }
                 )
               )(
                 $C.error(function(e){
                            log("(error)");
                            log(e.options.url);
                            return "error";
                          })
               )();
             },
             function(){
               log("para2:");
               $C.xhr("http://labs.mozilla.com/2009/02/introducing-bespin/")
               (
                 $C.ok(
                   function(html){
                     log("(ok!)");
                     return html;
                   }
                 )
               )(
                 $C.error(function(e){
                            log("(error)");
                            log(e.options.url);
                            return "error";
                          })
               )();
             }]
          )(
            function(result){
              log("para result:");
              log(result); // {0:(chain readme), 1:(bespin html)}
            }
          )();

}
