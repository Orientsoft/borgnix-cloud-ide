/**
 * Copyright 2013, 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
RED={}
RED.tabs = (function() {


    function createTabs(options) {
        var tabs = {};

        var ul = $("#"+options.id)
        ul.addClass("red-ui-tabs");
        ul.children().first().addClass("active");
        ul.children().addClass("red-ui-tab");

        function onTabClick() {
            activateTab($(this));
            return false;
        }

        function onTabDblClick() {
            if (options.ondblclick) {
                options.ondblclick(tabs[$(this).attr('href').slice(1)]);
            }
            return false;
        }

        function activateTab(link) {
            if (typeof link === "string") {
                link = ul.find("a[href='#"+link+"']");
            }
            if (!link.parent().hasClass("active")) {
                ul.children().removeClass("active");
                link.parent().addClass("active");
                if (options.onchange) {
                    options.onchange(tabs[link.attr('href').slice(1)]);
                }
            }
        }

        function updateTabWidths() {
            var tabs = ul.find("li.red-ui-tab");
            var width = ul.width();
            var tabCount = tabs.size();
            var tabWidth = (width-6-(tabCount*7))/tabCount;
            var pct = 100*tabWidth/width;
            tabs.css({width:pct+"%"});
        }

        ul.find("li.red-ui-tab a").on("click",onTabClick).on("dblclick",onTabDblClick);
        updateTabWidths();


        function removeTab(id) {
            var li = ul.find("a[href='#"+id+"']").parent();
            if (li.hasClass("active")) {
                var tab = li.prev();
                if (tab.size() === 0) {
                    tab = li.next();
                }
                activateTab(tab.find("a"));
            }
            li.remove();
            if (options.onremove) {
                options.onremove(tabs[id]);
            }
            delete tabs[id];
            updateTabWidths();
        }

        return {
            addTab: function(tab) {
                tabs[tab.id] = tab;
                var li = $("<li/>",{class:"red-ui-tab"}).appendTo(ul);
                var link = $("<a/>",{href:"#"+tab.id, class:"red-ui-tab-label"}).appendTo(li);
                link.html(tab.label);

                link.on("click",onTabClick);
                link.on("dblclick",onTabDblClick);
                if (tab.closeable) {
                    var closeLink = $("<a/>",{href:"#",class:"red-ui-tab-close"}).appendTo(li);
                    closeLink.html('<i class="fa fa-times" />');

                    closeLink.on("click",function(event) {
                        removeTab(tab.id);
                    });
                }
                updateTabWidths();
                if (options.onadd) {
                    options.onadd(tab);
                }
                link.attr("title",tab.label);
                if (ul.find("li.red-ui-tab").size() == 1) {
                    activateTab(link);
                }
            },
            removeTab: removeTab,
            activateTab: activateTab,
            resize: updateTabWidths,
            count: function() {
                return ul.find("li.red-ui-tab").size();
            },
            contains: function(id) {
                return ul.find("a[href='#"+id+"']").length > 0;
            },
            renameTab: function(id,label) {
                tabs[id].label = label;
                var tab = ul.find("a[href='#"+id+"']");
                tab.attr("title",label);
                tab.text(label);
                updateTabWidths();
            }

        }
    }

    return {
        create: createTabs
    }
})();

RED.menu = (function() {

    var menuItems = {};

    function createMenuItem(opt) {
        var item;

        function setState() {
            var savedStateActive = isSavedStateActive(opt.id);
            if (savedStateActive) {
                link.addClass("active");
                opt.onselect.call(opt, true);
            } else if (savedStateActive === false) {
                link.removeClass("active");
                opt.onselect.call(opt, false);
            } else if (opt.hasOwnProperty("selected")) {
                if (opt.selected) {
                    link.addClass("active");
                } else {
                    link.removeClass("active");
                }
                opt.onselect.call(opt, opt.selected);
            }
        }

        if (opt === null) {
            item = $('<li class="divider"></li>');
        } else {
            item = $('<li></li>');

            var linkContent = '<a '+(opt.id?'id="'+opt.id+'" ':'')+'tabindex="-1" href="#">';
            if (opt.toggle) {
                linkContent += '<i class="fa fa-square pull-left"></i>';
                linkContent += '<i class="fa fa-check-square pull-left"></i>';

            }
            if (opt.icon !== undefined) {
                if (/\.png/.test(opt.icon)) {
                    linkContent += '<img src="'+opt.icon+'"/> ';
                } else {
                    linkContent += '<i class="'+(opt.icon?opt.icon:'" style="display: inline-block;"')+'"></i> ';
                }
            }

            if (opt.sublabel) {
                linkContent += '<span class="menu-label-container"><span class="menu-label">'+opt.label+'</span>'+
                    '<span class="menu-sublabel">'+opt.sublabel+'</span></span>'
            } else {
                linkContent += '<span class="menu-label">'+opt.label+'</span>'
            }

            linkContent += '</a>';

            var link = $(linkContent).appendTo(item);

            menuItems[opt.id] = opt;

            if (opt.onselect) {
                link.click(function() {
                    if ($(this).parent().hasClass("disabled")) {
                        return;
                    }
                    if (opt.toggle) {
                        var selected = isSelected(opt.id);
                        if (typeof opt.toggle === "string") {
                            if (!selected) {
                                for (var m in menuItems) {
                                    if (menuItems.hasOwnProperty(m)) {
                                        var mi = menuItems[m];
                                        if (mi.id != opt.id && opt.toggle == mi.toggle) {
                                            setSelected(mi.id,false);
                                        }
                                    }
                                }
                                setSelected(opt.id,true);
                            }
                        } else {
                            setSelected(opt.id, !selected);
                        }
                    } else {
                        opt.onselect.call(opt);
                    }
                });
                setState();
            } else if (opt.href) {
                link.attr("target","_blank").attr("href",opt.href);
            } else if (!opt.options) {
                item.addClass("disabled");
                link.click(function(event) {
                    event.preventDefault();
                });
            }
            if (opt.options) {
                item.addClass("dropdown-submenu pull-left");
                var submenu = $('<ul id="'+opt.id+'-submenu" class="dropdown-menu"></ul>').appendTo(item);

                for (var i=0;i<opt.options.length;i++) {
                    createMenuItem(opt.options[i]).appendTo(submenu);
                }
            }
            if (opt.disabled) {
                item.addClass("disabled");
            }
            if (opt.tip) {
                item.popover({
                    placement:"left",
                    trigger: "hover",
                    delay: { show: 350, hide: 20 },
                    html: true,
                    container:'body',
                    content: opt.tip
                });
            }

        }


        return item;

    }
    function createMenu(options) {

        var button = $("#"+options.id);

        //button.click(function(event) {
        //    $("#"+options.id+"-submenu").show();
        //    event.preventDefault();
        //});


        var topMenu = $("<ul/>",{id:options.id+"-submenu", class:"dropdown-menu pull-right"}).insertAfter(button);

        for (var i=0;i<options.options.length;i++) {
            var opt = options.options[i];
            createMenuItem(opt).appendTo(topMenu);
        }
    }

    function isSavedStateActive(id) {
        return RED.settings.get("menu-" + id);
    }

    function isSelected(id) {
        return $("#" + id).hasClass("active");
    }

    function setSavedState(id, state) {
        RED.settings.set("menu-" + id, state);
    }

    function setSelected(id,state) {
        if (isSelected(id) == state) {
            return;
        }
        var opt = menuItems[id];
        if (state) {
            $("#"+id).addClass("active");
        } else {
            $("#"+id).removeClass("active");
        }
        if (opt.onselect) {
            opt.onselect.call(opt,state);
        }
        setSavedState(id, state);
    }

    function setDisabled(id,state) {
        if (state) {
            $("#"+id).parent().addClass("disabled");
        } else {
            $("#"+id).parent().removeClass("disabled");
        }
    }

    function addItem(id,opt) {
        createMenuItem(opt).appendTo("#"+id+"-submenu");
    }
    function removeItem(id) {
        $("#"+id).parent().remove();
    }

    function setAction(id,action) {

        //console.log(id);
        if(menuItems[id]){
            menuItems[id].onselect = action;
            $("#"+id).click(function() {
                if ($(this).parent().hasClass("disabled")) {
                    return;
                }
                if (menuItems[id].toggle) {
                    setSelected(id,!isSelected(id));
                } else {
                    menuItems[id].onselect.call(menuItems[id]);
                }
            });
        }
    }

    return {
        init: createMenu,
        setSelected: setSelected,
        isSelected: isSelected,
        setDisabled: setDisabled,
        addItem: addItem,
        removeItem: removeItem,
        setAction: setAction
        //TODO: add an api for replacing a submenu - see library.js:loadFlowLibrary
    }
})();


RED.sidebar = (function() {

    //$('#sidebar').tabs();
    var sidebar_tabs = RED.tabs.create({
        id:"sidebar-tabs",
        onchange:function(tab) {
            $("#sidebar-content").children().hide();
            $("#"+tab.id).show();
        },
        onremove: function(tab) {
            $("#"+tab.id).remove();
        }
    });
    
    function addTab(title,content,closeable) {
        $("#sidebar-content").append(content);
        $(content).hide();
        sidebar_tabs.addTab({id:"tab-"+title,label:title,closeable:closeable});
        //content.style.position = "absolute";
        //$('#sidebar').tabs("refresh");
    }

    function removeTab(title) {
        sidebar_tabs.removeTab("tab-"+title);
    }
    
    var sidebarSeparator =  {};
    $("#sidebar-separator").draggable({
            axis: "x",
            start:function(event,ui) {
                sidebarSeparator.closing = false;
                sidebarSeparator.opening = false;
                var winWidth = $(window).width();
                sidebarSeparator.start = ui.position.left;
                sidebarSeparator.chartWidth = $("#workspace").width();
                sidebarSeparator.chartRight = winWidth-$("#workspace").width()-$("#workspace").offset().left-2;


                /*if (!RED.menu.isSelected("btn-sidebar")) {
                    sidebarSeparator.opening = true;
                    var newChartRight = 15;
                    $("#sidebar").addClass("closing");
                    $("#workspace").css("right",newChartRight);
                    $("#chart-zoom-controls").css("right",newChartRight+20);
                    $("#sidebar").width(0);
                    RED.menu.setSelected("btn-sidebar",true);
                    RED.view.resize();
                    eventHandler.emit("resize");
                }*/
                sidebarSeparator.width = $("#sidebar").width();
            },
            drag: function(event,ui) {
                var d = ui.position.left-sidebarSeparator.start;
                var newSidebarWidth = sidebarSeparator.width-d;
                if (sidebarSeparator.opening) {
                    newSidebarWidth -= 13;
                }
                
                if (newSidebarWidth > 150) {
                    if (sidebarSeparator.chartWidth+d < 200) {
                        ui.position.left = 200+sidebarSeparator.start-sidebarSeparator.chartWidth;
                        d = ui.position.left-sidebarSeparator.start;
                        newSidebarWidth = sidebarSeparator.width-d;
                    }
                }
                    
                if (newSidebarWidth < 150) {
                    if (!sidebarSeparator.closing) {
                        $("#sidebar").addClass("closing");
                        sidebarSeparator.closing = true;
                    }
                    if (!sidebarSeparator.opening) {
                        newSidebarWidth = 150;
                        ui.position.left = sidebarSeparator.width-(150 - sidebarSeparator.start);
                        d = ui.position.left-sidebarSeparator.start;
                    }
                } else if (newSidebarWidth > 150 && (sidebarSeparator.closing || sidebarSeparator.opening)) {
                    sidebarSeparator.closing = false;
                    $("#sidebar").removeClass("closing");
                }

                var newChartRight = sidebarSeparator.chartRight-d;
                $("#workspace").css("right",newChartRight);
                $("#chart-zoom-controls").css("right",newChartRight+20);
                $("#sidebar").width(newSidebarWidth);

                sidebar_tabs.resize();
                RED.view.resize();
                eventHandler.emit("resize");
            },
            stop:function(event,ui) {
                RED.view.resize();
                if (sidebarSeparator.closing) {
                    $("#sidebar").removeClass("closing");
                    RED.menu.setSelected("btn-sidebar",false);
                    if ($("#sidebar").width() < 180) {
                        $("#sidebar").width(180);
                        $("#workspace").css("right",208);
                        $("#chart-zoom-controls").css("right",228);
                    }
                }
                $("#sidebar-separator").css("left","auto");
                $("#sidebar-separator").css("right",($("#sidebar").width()+13)+"px");
                eventHandler.emit("resize");
            }
    });
    
    function toggleSidebar(state) {
        if (!state) {
            $("#main-container").addClass("sidebar-closed");
        } else {
            $("#main-container").removeClass("sidebar-closed");
            sidebar_tabs.resize();
        }
        eventHandler.emit("resize");
    }
    
    function showSidebar(id) {
        if (id) {
            sidebar_tabs.activateTab("tab-"+id);
        }
    }
    
    function containsTab(id) {
        return sidebar_tabs.contains("tab-"+id);
    }
    
    function init () {
        RED.keyboard.add(/* SPACE */ 32,{ctrl:true},function(){RED.menu.setSelected("btn-sidebar",!RED.menu.isSelected("btn-sidebar"));d3.event.preventDefault();});
        showSidebar();
        RED.sidebar.info.show();
    }
    
    var eventHandler = (function() {
        var handlers = {};
        
        return {
            on: function(evt,func) {
                handlers[evt] = handlers[evt]||[];
                handlers[evt].push(func);
            },
            emit: function(evt,arg) {
                if (handlers[evt]) {
                    for (var i=0;i<handlers[evt].length;i++) {
                        handlers[evt][i](arg);
                    }
                    
                }
            }
        }
    })();
    
    return {
        init: init,
        addTab: addTab,
        removeTab: removeTab,
        show: showSidebar,
        containsTab: containsTab,
        toggleSidebar: toggleSidebar,
        on: eventHandler.on
    }
    
})();
