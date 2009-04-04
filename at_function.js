(function(){
   function scan(text){
     var c = '';
     var next = '';
     var quoted = false;
     var result = [];
     var commented = false;
     for(var i=0,l=text.length;i<l;++i){
       c = text[i];
       next = text[i+1];
       if(c == '"' || c == "'"){
         quoted = quoted ? false : c;
       } else if(!quoted){
         if(!commented && c == '/'){
           if(next == '*' || next == '/'){
             commented = scan_next();
           }
         } else if(commented == '/*' && c == '*'){
           if(next == '/'){
             commented = false;
             scan_next();
           }
         } else if(commented == '//' && c == '\n'){
           commented = false;
         } else if(!commented && c == '@'){
           c = 'function ';
           var with_paren = false;
           for(var c2=text[++i];c2!='{';c2=text[++i]){
             if(c2 == '('){
               with_paren = true;
             }
             c+=c2;
           }
           --i;
           if(!with_paren){
             c += '()';
           }
         }
       }
       result.push(c);
     }
     return result.join('');

     function scan_next(){
       c += next;
       ++i;
       return c;
     }
   }

   var scripts = document.getElementsByTagName('script');
   var script = scripts[scripts.length - 1];
   run(script.textContent);

   window.onload = function(e){
     var scripts = document.getElementsByTagName('script');
     for(var i=0,l=scripts.length;i<l;++i){
       var script = scripts[i];
       if(script.src && script.type == "application/af_javascript"){
         jQuery.get(script.src, function(content){run(content);});
         run(script);
       }
     }
   };


   function run(script){
     try{
       eval(scan(script));
     }catch(e){
     }
   }

 })();