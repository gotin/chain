(@{document.title = 'test';})();
if(window.parent==window){
  @log(s){console.log(s);};
  var test = @{
    $C(@main{
         log("start request to get existing file");
         $C.xhr("test.html")
         (
           $C.ok(@(html){
                   console.log("(ok!)");log(html);
                 })
         )(
           $C.error(@(e){
                      log("(error)");
                      log(e.options.url);
                      return "error";
                    })
         )(
           $C.wait()
         )(
           @sub(){
             log("start request to get unexisting file");
             $C.xhr("no_data.no")
             (
               $C.ok(@(txt){
                       log("(ok!)");
                       log(txt);
                     })
             )(
               $C.error(@(e){
                          log("(error)");
                          log(e.options.url);
                          return "error";
                        })
             )();
           } // sub
         )(
           @finish(a){
             log(a);
             log("end");
           } // finish
         )();
       } // main
      )();
  };

  $C.loop(3, test)  // 3times loop with 0ms wait
  (@{log("finish.");})();

  //event test
  (@{
     var count = 0;
     var $C2 = $C.create();
     $C2.loop(10,
              @{
                log(++count);
                $C2.event(document, "click")  // event driven chain
                (@(e){ // event call back
                   log("[click!!]"+count);
                   $C2(new Date().getTime())
                   (
                     $C2.cond(@(n){return n%2==0;},  // condition
                              @(){log("[even]");})   // action when condtion becomes true
                   )();
                 }); // event call back
              }
             )(
               @{log("10 times click");}  // function after finishing loop
             )();
   })();



  // pararell test
  var $C3 = $C.create();
  $C3.para([
             @{
               log("para1:");
               $C.xhr("test.html")
               (
                 $C.ok(
                   @(html){
                     log("(ok!)");
                     return html;
                   }
                 )
               )(
                 $C.error(@(e){
                            log("(error)");
                            log(e.options.url);
                            return "error";
                          })
               )();
             },
             @{
               log("para2:");
               $C.xhr("at_function.js")
               (
                 $C.ok(
                   @(html){
                     log("(ok!)");
                     return html;
                   }
                 )
               )(
                 $C.error(@(e){
                            log("(error)");
                            log(e.options.url);
                            return "error";
                          })
               )();
             }]
          )(
            @(result){
              log("para result:");
              log(result); // {0:(chain readme), 1:(bespin html)}
            }
          )();
}


