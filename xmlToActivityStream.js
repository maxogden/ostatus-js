//this is adapted from @daleharvey's codez
// TODO: Spec compliant with http://github.com/activitystreams/json-schema/

exports.xmlToActivityStreamJson = function(xml) {
  function rfc3339(date) {
    return date.getUTCFullYear()   + '-' +
      f(date.getUTCMonth() + 1) + '-' +
      f(date.getUTCDate())      + 'T' +
      f(date.getUTCHours())     + ':' +
      f(date.getUTCMinutes())   + ':' +
      f(date.getUTCSeconds())   + 'Z';
  };
  
  var i, item, body, date, data,
      re   = /^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/,
      str  = xml.replace(re, ""),
      feed = new XML(str);
      
  // this is nasty, but its rss, its supposed to be nasty
  // duck type rss vs atom
  if (feed.channel.length() > 0) {

    for (i = 0; i < feed.channel.item.length(); i++) {
      item = feed.channel.item[i];
      body = item.description.toString();
      date = new Date(item.pubDate.toString());
      
      if (!date) {  
       date = new Date();
      }	
      
      data = { 
        title : item.title.toString(),
        body  : body,
        link  : item.link.toString(),
        date : rfc3339(date),
        sourceTitle : feed.channel.title.toString()
      };
    }
  } else {
    default xml namespace="http://www.w3.org/2005/Atom";
    for each (item in feed..entry) { 
      body = item.content.toString();
      date = new Date(item.updated.toString());
      
      if (!date) { 
       date = new Date();
      }
        
      var link = null;
      if('link' in item) link = item.link[0].@href.toString();
      data = {
        title : item.title.toString(),
        body  : body,
        link  : link,
        date : rfc3339(date),
        sourceTitle : feed.title.toString()
      };
      
    }
  }
  
  return {
     "postedTime" : data.data,
     "object" : {
        "summary" : data.body,
        "permalinkUrl" : data.link,
        "objectType" : "article",
        "displayName" : data.title
     },
     "verb" : "post",
     "actor" : {
        "permalinkUrl" : data.link,
        "objectType" : "person",
        "displayName" : data.sourceTitle
     }
  }
}