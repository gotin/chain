/*
 *
 * chain.js
 *  js function chain library
 *  require "jQuery" (for xhr method)
 * Copyright(c) 2008 Go Kojima gou.kojima@gmail.com
 *
 * License:: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 *
 * sample1:
 * $C(0)
 * (function(x){
 *   log(x);  // 0
 *   return x+1;
 * })
 * (function(y){
 *   log(y);  // 1
 *   return y*2;
 * })
 * (function(z){
 *   log(z); // 2
 *   return z*3;
 * })();
 * log($C.value()); // 6
 *
 * * sample2:
 * $C(0)
 * (function(x){
 *   log(x);  // 0
 *   return x+1;
 * })
 * (function(y){
 *   $C.pause();
 *   $C.push(function(a){
 *     log("warikomi:" + a); // warikomi:2
 *     return a;
 *   });
 *   log(y);  // 1
 *   return y*2;
 * })
 * (function(z){
 *
 *   log(z); // 2
 *   return z*3;
 * })();
 * $C.resume();
 * log($C.value()); // 6
 *
 * [output]
 * 0
 * 1
 * warikomi:2
 * 2
 * 6
 */


var $C=
  window.$C=
  (function(){
     return create_chain();
     function create_chain(){
       var caller=null;
       var q = null;
       var stack = [];
       var current_value = null;
       var pause=false;
       var exception=null;

       var $$C = mk_init();
       $$C.create = create_chain;

       $$C.reset = function(){
         return function(){
           return wait(0, reset);
         };
       };

       $$C.pause = function(){
         pause = true;
         return this;
       };

       $$C.push = function(func){
         q.unshift(func);
         return this;
       };

       $$C.resume = function(){
         pause = false;
         start();
       };

       $$C.set_caller = function(c){
         caller = c;
       };

       $$C.xhr_json = make_xhr_function("json");
       $$C.xhr = make_xhr_function();
       $$C.ajax = ajax;

       $$C.wait = function(t){
         return function(){
           return wait(t);
         };
       };
       $$C.ok = function(func){
         return function(ret){
           if(exception){
             return ret;
           } else {
             $$C(ret)
             (func)
             ();
             return ret;
           }
         };
       };
       $$C.error = function(func){
         return function(ret){
           if(exception){
             $$C(exception)
             (function(e){exception=null;return e;})
             (func)
             ();
             return ret;
           } else {
             return ret;
           }
         };
       };
       $$C.cond = function(cond, func){
         return function(ret){
           if(condition(cond, ret)){
             return func(ret);
           } else {
             return ret;
           }
         };

         function condition(cond, value){
           var type = typeof cond;
           var result = false;
           if(type == "function"){
             result = cond(value);
           } else if(type == "object" && cond.constructor == "RegExp"){
             result = String(value).match(cond);
           } else {
             result = (cond == value);
           }
           return result;
         }

       };



       $$C.value = function(){
         return current_value;
       };

       $$C.para = parallel;
       $$C.loop = loop;
       $$C.for_loop = for_loop;
       $$C.event = event;
       return $$C;


       function reset(){
         caller=null;
         q = null;
         stack = [];
         current_value = null;
         pause=false;
       };

       function chain_apply_function(){
         return chain.apply(null, arguments);
       }

       function wait(t, func){
         $$C.pause();
         $$C();
         setTimeout(function(){
                      $$C.resume();
                      if(typeof func=="function")
                        func();
                    },t||0);
         return chain_apply_function;
       }

       function XHRException(xhr, textStatus, error, options){
         this.xhr = xhr;
         this.textStatus = textStatus;
         this.error = error;
         this.options = options;
       }
       XHRException.prototype.toString = function(){
         return "XHR exception:" + this.options.url + ":" + this.textStatus;
       };

       function ajax(options){
         optinos = options||{};
         if(options.url){
           $$C.pause();
           $$C();
           if("GM_xmlhttpRequest" in this){
             var done = false;
             var timeout = options.timeout || (options.timeout = 3 * 1000);
             options.method = options.type||"GET";
             options.dataType || (options.dataType ="html");
             options.onload = function(xhr){
               if(done)return;
               done = true;
               var data = xhr.responseText;
               if(String(options.dataType).match(/^json$/i)){
                 try{
                   data = eval("("+data+")");
                 }catch(e){
                   done = false;
                   options.onerror(xhr);
                 }
               }
               $$C.push(data);
               $$C.resume();
             };
             options.onerror = function(xhr){
               if(done)return;
               done = true;
               $$C.push(function(){
                          throw new XHRException(xhr, xhr.responseStatus, null, options);
                        });
               $$C.resume();
             };
             GM_xmlhttpRequest(options);
             setTimeout(options.onerror, timeout);
           } else {
             options.success = function(data, status){
               $$C.push(data);
               $$C.resume();
             };
             options.error = function(xhr, textStatus, error){
               $$C.push(function(){
                          throw new XHRException(xhr, textStatus, error, options);
                        });
               $$C.resume();
             };
             jQuery.ajax(options);
           }
         }
         return chain_apply_function;
       }

       function make_xhr_function(data_type){
         return function(url, options){
           options = options||{};
           if(data_type)
             options.dataType = data_type;
           options.url = url;
           return ajax(options);
         };
       }

       function mk_init(){
         return init;
       }

       function init(){
         if(q) stack.push({q:q,value:current_value});
         q = [];
         return chain.apply(null, arguments);
       }

       function chain(){
         if(!q)q=[];
         if(arguments.length)q.push(arguments[0]);
         return function(){
           return start.apply(null, arguments);
         };
       }

       function start(){
         execute();
         var ret = chain.apply(null, arguments);
         execute_stack_if_q_empty();
         return ret;

         function execute_stack_if_q_empty(){
           if(q.length==0){
             var prop = stack.pop();
             if(!prop) return; // stack is empty
             q = prop.q;
             // current_value = ....
             execute();
             arguments.callee();
           }
         }
       }

       function execute(){
         if(pause) return false;
         while(q.length && !pause){
           var next = q.shift();
           try{
             if(typeof next == "function"){
               try{
                 current_value = next.call(caller, current_value);
               }catch(e){
                 exception = e;
               }
             } else {
               current_value = next;
             }
           }catch(e){
             //log("Exception!!!!!!");
             //log(e);
           }
         }
         return current_value;
       }

       function parallel(todo){
         var result = {};
         var c = null;
         for(var a in todo){
           c = (c ? c(todo[a]):$$C(todo[a]))(mk_set_func(a));
         }
         return c(function(){return result;});

         function mk_set_func(work_id){
           return  function(ret){
             result[work_id] = ret;
           };
         }
       }

       function loop(n, t, func){
         var init = function(){this.i=n;};
         var cond = function(){return this.i;};
         var incr = function(){return this.i--;};
         if(typeof n == "function"){
           func = n;
           init = incr = function(){};
           cond = function(){return true;};
         } else if(typeof t == "function"){
           func = t;
           t = 0;
         }

         return for_loop(init, cond, incr, t)(func);
       }

       function for_loop(){
         var args = Array.prototype.slice.apply(arguments);
         var init = args[0]||function(){};
         var cond = args[1]||function(){return true;};
         var incr = args[2]||function(){};
         var wait_time = args[3]||0;
         return function(func){
           init.apply(args);
           $$C();
           task();
           return chain_apply_function;

           function task(){
             var result = false;
             if((result = cond.apply(args))){
               $$C(func)($$C.wait(wait_time))(function(){incr.apply(args);})(task);
             }
             return result;
           }
         };
       }

       function event(target, type){
         $$C.pause();
         $(target).bind(type,
                        function(e){
                          $$C.push(e);
                          $(target).unbind(type);
                          $$C.resume();
                        });
         return chain_apply_function;
       }


       // utility
       function array(a){
         return Array.prototype.slice.apply(a);
       }
     }



   })();
