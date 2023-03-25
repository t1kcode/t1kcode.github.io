/**
 * Sets up Justified Gallery.
 */
if (!!$.prototype.justifiedGallery) {
  var options = {
    rowHeight: 140,
    margins: 4,
    lastRow: "justify"
  };
  $(".article-gallery").justifiedGallery(options);
}

$(document).ready(function () {

  /**
   * Shows the responsive navigation menu on mobile.
   */
  $("#header > #nav > ul > .icon").click(function () {
    $("#header > #nav > ul").toggleClass("responsive");
  });


  /**
   * Controls the different versions of  the menu in blog post articles 
   * for Desktop, tablet and mobile.
   */
  if ($(".post").length) {
    var menu = $("#menu");
    var nav = $("#menu > #nav");
    var menuIcon = $("#menu-icon, #menu-icon-tablet");

    /**
     * Display the menu on hi-res laptops and desktops.
     */
    if ($(document).width() >= 1440) {
      menu.show();
      menuIcon.addClass("active");
    }

    /**
     * Display the menu if the menu icon is clicked.
     */
    menuIcon.click(function () {
      if (menu.is(":hidden")) {
        menu.show();
        menuIcon.addClass("active");
      } else {
        menu.hide();
        menuIcon.removeClass("active");
      }
      return false;
    });

    /**
     * Add a scroll listener to the menu to hide/show the navigation links.
     * 菜单滚动显示隐藏
     */
    if (menu.length) {
      
      $(window).on("scroll", function () {
        return
        var position = menu.offset().top;
        var topDistance = menu.offset().top;
        // hide only the navigation links on desktop


        // if (!nav.is(":visible") && topDistance < 50) {
        //   nav.show();
        // } else if (nav.is(":visible") && topDistance > 100) {
        //   nav.hide();
        // }
        $(window).scroll(function () {
          var scroll = menu.offset().top;
          if (scroll > position) {
            nav.hide();
            $("#menu-icon-tablet").hide();
          } else {
            nav.show();
            $("#menu-icon-tablet").show();
          }
          position = scroll;
        });



        // on tablet, hide the navigation icon as well and show a "scroll to top
        // icon" instead
        if (!$("#menu-icon").is(":visible") && topDistance < 50) {
          // $("#menu-icon-tablet").show();
          $("#top-icon-tablet").hide();
        } else if (!$("#menu-icon").is(":visible") && topDistance > 100) {
          // $("#menu-icon-tablet").hide();
          $("#top-icon-tablet").show();
        }
      });
    }

    /**
     * Show mobile navigation menu after scrolling upwards,
     * hide it again after scrolling downwards.
     */

    if ($("#footer-post").length) {
      var lastScrollTop = 100;
      $(window).on("scroll", function () {
        var topDistance = $(window).scrollTop();
        // console.log(topDistance)
        if (topDistance > lastScrollTop) {
          // downscroll -> show menu
          // $("#footer-post").hide();
          lastScrollTop = topDistance;
        } else {
          // upscroll -> hide menu
          // $("#footer-post").show();
          lastScrollTop = topDistance;
        }
        // close all submenu"s on scroll
        $("#nav-footer").hide();
        $("#toc-footer").hide();
        $("#share-footer").hide();

        // show a "navigation" icon when close to the top of the page, 
        // otherwise show a "scroll to the top" icon
        if (topDistance < 50) {
          $("#actions-footer > #top").hide();
        } else if (topDistance > 100) {
          $("#actions-footer > #top").show();
        }
      });

      //显示隐藏
      $("#actions-footer > span").click(function () {
        let e = $(this).attr("Popup")
        if ($(e).css('display') == 'none') {
          let item = $('#footer-post > .Popup')
          for (let i = 0; i < item.length; i++) {
            item[i].style.display = 'none'
          }
          $(e).show()
        } else {
          $(e).hide()
        }
      })
    }
  }



  clickTreeDirectory();
  serachTree();
  pjaxLoad();
  showArticleIndex();
  switchTreeOrIndex();
  imgClick()
});

function imgClick(){
  let imgpup = $('.img-pup')
  $('img').click(function () {
    imgpup.show()
    $('.img-pup > img')[0].src = this.src
  })
  imgpup.click(() => {
    imgpup.hide()
  })
}


function switchTreeOrIndex() {
  let t = true;
  $("#search-icon").on("click", function (e) {
    if(t){
      $(".fa-folder").removeClass("fa-folder").addClass("fa-folder-open");
      $("aside ul ul").css("display", "block");
      t= false;
    }else{
      $(".fa-folder-open").removeClass("fa-folder-open").addClass("fa-folder");
      $('aside ul ul .active').parents('ul li').find('.fa-folder').removeClass("fa-folder").addClass("fa-folder-open");
      $("aside ul ul").css("display", "none");
      $('aside ul ul .active').parents('ul').css("display", "block");
      $('aside ul ul .active').parents('ul').siblings('ul').css("display", "block");
      t = true;
    }
    
  });
  
}
//局部刷新
function pjaxLoad(){
  $(document).pjax('#tree a', '.hubzy_center', {fragment:'.hubzy_center', timeout:8000});
  $(document).pjax('#tree a', '.hubzy_right', {fragment:'.hubzy_right', timeout:8000});
  $(document).on({
      "pjax:complete": function(e) {
          // 添加 active
          $("#tree .active").removeClass("active");
          e.relatedTarget.parentNode.classList.add("active");
          //文章目录更新
          showArticleIndex() 
          imgClick()
      }
  });
}


function showArticleIndex() {
  // 先刷一遍文章有哪些节点，把 h1 h2 h3 加入列表，等下循环进行处理。
  // 如果不够，可以加上 h4 ,只是我个人觉得，前 3 个就够了，出现第 4 层就目录就太长了，太细节了。
  var h1List = h2List = h3List = [];
  var labelList = $("#article").children();
  for (var i = 0; i < labelList.length; i++) {
    if ($(labelList[i]).is("h1")) {
      h2List = new Array();
      h1List.push({ node: $(labelList[i]), id: i, children: h2List });
    }

    if ($(labelList[i]).is("h2")) {
      h3List = new Array();
      h2List.push({ node: $(labelList[i]), id: i, children: h3List });
    }

    if ($(labelList[i]).is("h3")) {
      h3List.push({ node: $(labelList[i]), id: i, children: [] });
    }
  }

  // 闭包递归，返回树状 html 格式的文章目录索引
  function show(tocList) {
    var content = "<ol>";
    tocList.forEach(function (toc) {
      toc.node.before('<span class="anchor" id="_label' + toc.id + '"></span>');
      if (toc.children == 0) {
        content += '<li class="toc-item toc-level-3"><a href="#_label' + toc.id + '">' + toc.node.text() + '</a></li>';
      }
      else {
        content += '<li class="toc-item toc-level-2"><a href="#_label' + toc.id + '">' + toc.node.text() + '</a>' + show(toc.children) + '</li>';
      }
    });
    content += "</ol>"
    return content;
  }

  // 最后组合成 div 方便 css 设计样式，添加到指定位置
  $("#toc").empty();
  $("#toc").append(show(h1List));

  // 点击目录索引链接，动画跳转过去，不是默认闪现过去
  $("#toc a").on("click", function (e) {
    e.preventDefault();
    // 获取当前点击的 a 标签，并前触发滚动动画往对应的位置
    var target = $(this.hash);
    $("body, html").animate(
      { 'scrollTop': target.offset().top -160},
      500
    );
  });

  // 监听浏览器滚动条，当浏览过的标签，给他上色。
  $(window).on("scroll", function (e) {
    var anchorList = $(".anchor");
    anchorList.each(function () {
      var tocLink = $('#toc a[href="#' + $(this).attr("id") + '"]');
      var anchorTop = $(this).offset().top;
      var windowTop = $(window).scrollTop();
      if (anchorTop <= windowTop + 200) {
        tocLink.addClass("read");
      }
      else {
        tocLink.removeClass("read");
      }
    });
  });
}



// 搜索框输入事件
function serachTree() {
  // 解决搜索大小写问题
  jQuery.expr[':'].contains = function (a, i, m) {
    return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
  };

  $("#search input").on("input", function (e) {
    e.preventDefault();

    // 获取 inpiut 输入框的内容
    var inputContent = e.currentTarget.value;

    // 没值就收起父目录，但是得把 active 的父目录都展开
    if (inputContent.length === 0) {
      $(".fa-folder-open").removeClass("fa-folder-open").addClass("fa-folder");
      $("#tree ul").css("display", "none");
      if ($("#tree .active").length) {
        showActiveTree($("#tree .active"), true);
      }
      else {
        $("#tree").children().css("display", "block");
      }
    }
    // 有值就搜索，并且展开父目录
    else {
      $(".fa-folder").removeClass("fa-folder").addClass("fa-folder-open");
      $("#tree ul").css("display", "none");
      var searchResult = $("#tree li").find("a:contains('" + inputContent + "')");
      if (searchResult.length) {
        showActiveTree(searchResult.parent(), false)
      }
    }
  });
}

// 点击目录事件
function clickTreeDirectory() {
  // 判断有 active 的话，就递归循环把它的父目录打开
  var treeActive = $("#tree .active");
  if (treeActive.length) {
    showActiveTree(treeActive, true);
  }

  // 点击目录，就触发折叠动画效果
  $(document).on("click", "#tree a[class='directory']", function (e) {
    // 用来清空所有绑定的其他事件
    e.preventDefault();

    var icon = $(this).children(".fa");
    var iconIsOpen = icon.hasClass("fa-folder-open");
    var subTree = $(this).siblings("ul");

    icon.removeClass("fa-folder-open").removeClass("fa-folder");

    if (iconIsOpen) {
      if (typeof subTree != "undefined") {
        subTree.slideUp({ duration: 100 });
      }
      icon.addClass("fa-folder");
    } else {
      if (typeof subTree != "undefined") {
        subTree.slideDown({ duration: 100 });
      }
      icon.addClass("fa-folder-open");
    }
  });
}

// 循环递归展开父节点
function showActiveTree(jqNode, isSiblings) {
  if (jqNode.attr("id") === "tree") { return; }
  if (jqNode.is("ul")) {
    jqNode.css("display", "block");

    // 这个 isSiblings 是给搜索用的
    // true 就显示开同级兄弟节点
    // false 就是给搜索用的，值需要展示它自己就好了，不展示兄弟节点
    if (isSiblings) {
      jqNode.siblings().css("display", "block");
      jqNode.siblings("a").css("display", "inline");
      jqNode.siblings("a").find(".fa-folder").removeClass("fa-folder").addClass("fa-folder-open");
    }
  }
  jqNode.each(function () { showActiveTree($(this).parent(), isSiblings); });
}

