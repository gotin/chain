log('---sample1---');
$C(0)
(function(x){
  log(x);  // 0
  return x+1;
})
(function(y){
  log(y);  // 1
  return y*2;
})
(function(z){
  log(z); // 2
  return z*3;
})();
log($C.value()); // 6

// sample2:
log('---sample2---');
$C(0)
(function(x){
  log(x);  // 0
  return x+1;
})
(function(y){
  $C.pause();
  $C.push(function(a){
    log("warikomi:" + a); // warikomi:2
    return a;
  });
  log(y);  // 1
  return y*2;
})
(function(z){

  log(z); // 2
  return z*3;
})();
$C.resume();
log($C.value()); // 6

log('---xhr sample---');
$C.xhr('/static/test1')(
  function(result){
    return result;
  }
)(
  function(x){
    log('--- xhr sample 1st result');
    log(x);
    $C.xhr('/static/test2');
  }
)(
  function(x){
    log('--- xhr sample 2nd result');
    log(x);
  }
)();

log('---xhr sample2---');
function xhr_sample2(){
  var $C2 = $C.create();
  $C2.para({
    xhr1: function(chain){
      return chain.xhr('/static/test1')(
        chain.error(function(ex){
          log('--- Error!');
          log(ex);
          return ex;
        })
      )(
        function(r){
          return x;
        }
      );
    },
    xhr2: function(chain){
      return chain.xhr('/static/test2')(
        chain.error(function(ex){
          log('--- Error!');
          log(ex);
          return ex;
        })
      );
    },
    xhr3: function(chain){
      return chain.xhr('/static/errort1')(
        chain.error(function(ex){
          log('--- Error!');
          log(ex);
          return ex;
        })
      )(
        function(r){
          return r;
        }
      );
    }
  })(
    function(result){
      log('--- para xhr result');
      log(result);
    }
  )();
}

var $C3 = $C.create();
$C3.for_loop()(
  function(){
    $C3.event('#button', 'click')(
      function(e){
        log('button clicked');
        xhr_sample2();
      }
    )();
  }
)();



function log(x){
  console.log(x);

}