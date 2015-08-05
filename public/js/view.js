/**
 * Copyright 2013, 2014 IBM Corp.
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
var RED = (function() {

    $(window).bind("beforeunload",function(){


    });

    var deploymentTypes = {
        "full":{img:"images/deploy-full-o.png"},
        "nodes":{img:"images/deploy-nodes-o.png"},
        "flows":{img:"images/deploy-flows-o.png"}
    }
    var deploymentType = "full";

    function startUserFlows(flows){

        $.ajax({
            url:"/scene",
            type: "POST",
            data: JSON.stringify(flows),
            contentType: "application/json; charset=utf-8"
        }).done(function(data,textStatus,xhr) {
                RED.notify("Successfully saveed","success");
                RED.nodes.eachNode(function(node) {
                    if (node.changed) {
                        node.dirty = true;
                        node.changed = false;
                    }
                    if(node.credentials) {
                        delete node.credentials;
                    }
                });
                RED.nodes.eachConfig(function (confNode) {
                    if (confNode.credentials) {
                        delete confNode.credentials;
                    }
                });
                // Once deployed, cannot undo back to a clean state
                RED.history.markAllDirty();
                RED.view.redraw();
            }).fail(function(xhr,textStatus,err) {
                RED.view.dirty(true);
                if (xhr.responseText) {
                    RED.notify("<strong>Error</strong>: "+xhr.responseText,"error");
                } else {
                    RED.notify("<strong>Error</strong>: no response from server","error");
                }
            }).always(function() {
                $("#btn-icn-deploy").removeClass('spinner');
                $("#btn-icn-deploy").addClass('fa-download');
            });


    }

    function saveUserFlows(flows){

        $.ajax({
            url:"/userflows",
            type: "POST",
            data: JSON.stringify(flows),
            contentType: "application/json; charset=utf-8"
        }).done(function(data,textStatus,xhr) {
                RED.notify("Successfully saveed","success");
                RED.nodes.eachNode(function(node) {
                    if (node.changed) {
                        node.dirty = true;
                        node.changed = false;
                    }
                    if(node.credentials) {
                        delete node.credentials;
                    }
                });
                RED.nodes.eachConfig(function (confNode) {
                    if (confNode.credentials) {
                        delete confNode.credentials;
                    }
                });
                // Once deployed, cannot undo back to a clean state
                RED.history.markAllDirty();
                RED.view.redraw();
            }).fail(function(xhr,textStatus,err) {
                RED.view.dirty(true);
                if (xhr.responseText) {
                    RED.notify("<strong>Error</strong>: "+xhr.responseText,"error");
                } else {
                    RED.notify("<strong>Error</strong>: no response from server","error");
                }
            }).always(function() {
                $("#btn-icn-deploy").removeClass('spinner');
                $("#btn-icn-deploy").addClass('fa-download');
            });


    }
    function save(force) {

        if(deploymentType=='flows'){
            var nns=RED.view.getEditSceens(true);
            var tabNode=RED.nodes.workspace(RED.view.getWorkspace());
            nns.push(RED.nodes.workspace(RED.view.getWorkspace()));
            //console.log(JSON.stringify(tabNode),JSON.stringify(nns));
            startUserFlows(nns);
            return;
        }

        if (RED.view.dirty()) {
            //$("#debug-tab-clear").click();  // uncomment this to auto clear debug on deploy

            if (!force) {
                var invalid = false;
                var unknownNodes = [];
                RED.nodes.eachNode(function(node) {
                    invalid = invalid || !node.valid;
                    if (node.type === "unknown") {
                        if (unknownNodes.indexOf(node.name) == -1) {
                            unknownNodes.push(node.name);
                        }
                        invalid = true;
                    }
                });
                if (invalid) {
                    if (unknownNodes.length > 0) {
                        $( "#node-dialog-confirm-deploy-config" ).hide();
                        $( "#node-dialog-confirm-deploy-unknown" ).show();
                        var list = "<li>"+unknownNodes.join("</li><li>")+"</li>";
                        $( "#node-dialog-confirm-deploy-unknown-list" ).html(list);
                    } else {
                        $( "#node-dialog-confirm-deploy-config" ).show();
                        $( "#node-dialog-confirm-deploy-unknown" ).hide();
                    }
                    $( "#node-dialog-confirm-deploy" ).dialog( "open" );
                    return;
                }
            }
            var nns = RED.nodes.createCompleteNodeSet();

            $("#btn-icn-deploy").removeClass('fa-download');
            $("#btn-icn-deploy").addClass('spinner');
            RED.view.dirty(false);

            $.ajax({
                url:"flows",
                type: "POST",
                data: JSON.stringify(nns),
                contentType: "application/json; charset=utf-8",
                headers: {
                    "Node-RED-Deployment-Type":deploymentType
                }
            }).done(function(data,textStatus,xhr) {
                    RED.notify("Successfully deployed","success");
                    RED.nodes.eachNode(function(node) {
                        if (node.changed) {
                            node.dirty = true;
                            node.changed = false;
                        }
                        if(node.credentials) {
                            delete node.credentials;
                        }
                    });
                    RED.nodes.eachConfig(function (confNode) {
                        if (confNode.credentials) {
                            delete confNode.credentials;
                        }
                    });
                    // Once deployed, cannot undo back to a clean state
                    RED.history.markAllDirty();
                    RED.view.redraw();
                }).fail(function(xhr,textStatus,err) {
                    RED.view.dirty(true);
                    if (xhr.responseText) {
                        RED.notify("<strong>Error</strong>: "+xhr.responseText,"error");
                    } else {
                        RED.notify("<strong>Error</strong>: no response from server","error");
                    }
                }).always(function() {
                    $("#btn-icn-deploy").removeClass('spinner');
                    $("#btn-icn-deploy").addClass('fa-download');
                });
        }
    }

    $('#btn-deploy').click(function() { save(); });
    $('#btn-save').click(function() {
        //RED.view.selectAll();
        var nns=RED.view.showExportNodesDialog(true);
        var tabNode=RED.nodes.workspace(RED.view.getWorkspace());
        nns.push(RED.nodes.workspace(RED.view.getWorkspace()));
        console.log(JSON.stringify(tabNode),JSON.stringify(nns));
        saveUserFlows({"tabName":tabNode.label,'tabId':tabNode.id,"flows":nns});

    });

    $('#btn-deployone').click(function() {
        //RED.view.selectAll();
        var nns=RED.view.showExportNodesDialog(true);
        var tabNode=RED.nodes.workspace(RED.view.getWorkspace());
        nns.push(RED.nodes.workspace(RED.view.getWorkspace()));
        console.log(JSON.stringify(tabNode),JSON.stringify(nns));
        startUserFlows(nns);

    });


    var iconW =70, iconH=70,grid=25;

    function drawImage(context,url,x,y){

        var img=new Image();
        img.src=url;

        img.onload=function(){

            context.drawImage(img,x+70/2-70-30, y-70/2,iconW,iconH);

            var text='msg.payload';
            context.fillText(text,x+70/2-70-15-text.length,y+70);
        }

    }

    function drawNode(context,node){

        var img=new Image();
        img.src=node.url;

        if(!node.label){
            node.label="";
        }

        img.onload=function(){

            context.drawImage(img,node.x+70/2-70-30, node.y-70/2,iconW,iconH);
            context.fillText(node.label,node.x+70/2-70-15-node.label.length,node.y+70);
        }

    }



    function drawGird(context,width,height){


        context.beginPath();
        context.lineWidth=0.2;
        context.strokeStyle = 'black';

        var yCount=width/grid,xCount=height/grid;

        for(var i=1;i<yCount;i++){

            context.moveTo(0,i*grid);
            context.lineTo(width,i*grid);

        }

        for(var i=1;i<yCount;i++){

            context.moveTo(i*grid,0);

            context.lineTo(i*grid,height);
        }


        context.stroke();


    }


    function drawLinkLine(context,sourceX,sourceY,targetX,targetY){

        var m={x:0,y:0};
        m.x=sourceX+115/2-140/2+20;
        m.y=sourceY;

        console.log(m);

        var c1,c2,c3,c4,c5,c6;


        c1=(sourceX+115/2+0.75*70);
        c2=(sourceY);
        c3= (targetX-115/2-0.75*70);
        c4= (targetY);
        c5= (targetX-70);
        c6= targetY;


        context.beginPath();
        context.moveTo(m.x,m.y);
        console.log(c1,c2,c3,c4,c5,c6);
        context.bezierCurveTo(c1,c2,c3,c4,c5,c6);
        context.lineWidth = 3;

        context.stroke();

    }




    $('#btn-cap').click(function() {

        var flows=RED.view.getEditSceens(true);

        var tabNode=RED.nodes.workspace(RED.view.getWorkspace());
        flows.push(tabNode);

        //var a=  $( "#dialog" );

        $('#dialog-form').append('<canvas id="canvas1" width="2000" height="2000" hidened>Update you browser to enjoy canvas!</canvas>');


        var canvas = Borgnix.scene.drawScene("canvas1",flows,2000,2000);


        notification = RED.notify("<b>Sucess</b>: 绛夊緟鑷姩鐢熸垚鍥剧墖 ","success");

        $("#dialog-form").empty();
        $("#dialog-form").html('<div>绛夊緟鑷姩鐢熸垚鍥剧墖</div>');
        $("#dialog" ).dialog("option","title","鍒嗕韩鎴浘").dialog( "open" );


        setTimeout(function(){

            notification = RED.notify("<b>Sucess</b>: 鍥剧墖宸茬粡鐢熸垚 ","success");

            var image = new Image();
            image.id="export_node";
            image.src =canvas.toDataURL('image/png');

            $("#dialog-form").empty();
            $("#dialog-form").html(image);
            $("#dialog-form").append("<a class='btn btn-primary btn-raised ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only' download='"+ (new Date()).getTime()+"_image.png"+"' href='"+$("#export_node").attr('src')+"'>淇濆瓨鍥剧墖</a>");
            $("#canvas1").remove();

        },1000)


    });




    $( "#node-dialog-confirm-deploy" ).dialog({
        title: "Confirm deploy",
        modal: true,
        autoOpen: false,
        width: 530,
        height: 230,
        buttons: [
            {
                text: "Confirm deploy",
                click: function() {
                    save(true);
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]
    });

    function loadSettings() {
        RED.settings.init(loadNodeList);
    }

    function loadNodeList() {
        $.ajax({
            headers: {
                "Accept":"application/json"
            },
            cache: false,
            url: 'nodes',
            success: function(data) {
                RED.nodes.setNodeList(data);
                loadNodes();
            }
        });
    }

    function loadNodes() {
        $.ajax({
            headers: {
                "Accept":"text/html"
            },
            cache: false,
            url: 'nodes',
            success: function(data) {
                $("body").append(data);
                $(".palette-spinner").hide();
                $(".palette-scroll").show();
                $("#palette-search").show();
                loadFlows();
            }
        });
    }

    function loadFlows() {
        $.ajax({
            headers: {
                "Accept":"application/json"
            },
            cache: false,
            url: 'flows',
            success: function(nodes) {
                RED.nodes.import(nodes);
                RED.view.dirty(false);
                RED.view.redraw();
                RED.comms.subscribe("status/#",function(topic,msg) {
                    var parts = topic.split("/");
                    var node = RED.nodes.node(parts[1]);
                    if (node) {
                        node.status = msg;
                        if (statusEnabled) {
                            node.dirty = true;
                            RED.view.redraw();
                        }
                    }
                });
                RED.comms.subscribe("node/#",function(topic,msg) {
                    var i,m;
                    var typeList;
                    var info;

                    if (topic == "node/added") {
                        var addedTypes = [];
                        for (i=0;i<msg.length;i++) {
                            m = msg[i];
                            var id = m.id;
                            RED.nodes.addNodeSet(m);
                            if (m.loaded) {
                                addedTypes = addedTypes.concat(m.types);
                                $.get('nodes/'+id, function(data) {
                                    $("body").append(data);
                                });
                            }
                        }
                        if (addedTypes.length) {
                            typeList = "<ul><li>"+addedTypes.join("</li><li>")+"</li></ul>";
                            RED.notify("Node"+(addedTypes.length!=1 ? "s":"")+" added to palette:"+typeList,"success");
                        }
                    } else if (topic == "node/removed") {
                        for (i=0;i<msg.length;i++) {
                            m = msg[i];
                            info = RED.nodes.removeNodeSet(m.id);
                            if (info.added) {
                                typeList = "<ul><li>"+m.types.join("</li><li>")+"</li></ul>";
                                RED.notify("Node"+(m.types.length!=1 ? "s":"")+" removed from palette:"+typeList,"success");
                            }
                        }
                    } else if (topic == "node/enabled") {
                        if (msg.types) {
                            info = RED.nodes.getNodeSet(msg.id);
                            if (info.added) {
                                RED.nodes.enableNodeSet(msg.id);
                                typeList = "<ul><li>"+msg.types.join("</li><li>")+"</li></ul>";
                                RED.notify("Node"+(msg.types.length!=1 ? "s":"")+" enabled:"+typeList,"success");
                            } else {
                                $.get('nodes/'+msg.id, function(data) {
                                    $("body").append(data);
                                    typeList = "<ul><li>"+msg.types.join("</li><li>")+"</li></ul>";
                                    RED.notify("Node"+(msg.types.length!=1 ? "s":"")+" added to palette:"+typeList,"success");
                                });
                            }
                        }
                    } else if (topic == "node/disabled") {
                        if (msg.types) {
                            RED.nodes.disableNodeSet(msg.id);
                            typeList = "<ul><li>"+msg.types.join("</li><li>")+"</li></ul>";
                            RED.notify("Node"+(msg.types.length!=1 ? "s":"")+" disabled:"+typeList,"success");
                        }
                    }
                });
            }
        });
    }

    var statusEnabled = false;
    function toggleStatus(state) {
        statusEnabled = state;
        RED.view.status(statusEnabled);
    }

    function showHelp() {

        var dialog = $('#node-help');

        //$("#node-help").draggable({
        //        handle: ".modal-header"
        //});

        dialog.on('show',function() {
            RED.keyboard.disable();
        });
        dialog.on('hidden',function() {
            RED.keyboard.enable();
        });

        dialog.modal();
    }

    function changeDeploymentType(type) {
        deploymentType = type;
        $("#btn-deploy img").attr("src",deploymentTypes[type].img);
    }

    function loadEditor() {
        RED.menu.init({id:"btn-sidemenu",
            options: [
                //JetBean Echancement
                {id:"btn-logout",icon:"fa fa-power-off",label:"娉ㄩ攢鐧诲綍",href:'javascript:this.location="/logout"'},
                {id:"btn-profile",icon:"fa fa-cog",label:"璐︽埛淇℃伅",href:'javascript:this.location="/profile"'},
                null,
                {id:"btn-active",icon:"fa fa-share-alt",label:"鍦烘櫙绠＄悊",href:'javascript:this.location="/scene"'},
                null,
                {id:"btn-sidebar",label:"鍙充晶淇℃伅鏍�",toggle:true,onselect:RED.sidebar.toggleSidebar, selected: true},
                {id:"btn-node-status",label:"鏄剧ず鑺傜偣鐘舵€�",toggle:true,onselect:toggleStatus, selected: true},
                null,

                {id:"btn-import-menu",icon:"fa fa-upload", label:"瀵煎叆",href:'javascript:RED.view.showImportNodesDialog()'},
                {id:"btn-import-menu",icon:"fa fa-download", label:"瀵煎嚭",href:'javascript:RED.view.showExportNodesDialog(true);'},

                /*{id:"btn-import-menu",label:"Import",options:[
                 {id:"btn-import-clipboard",label:"Clipboard",onselect:RED.view.showImportNodesDialog},
                 {id:"btn-import-library",label:"Library",options:[]}
                 ]},

                 {id:"btn-export-menu",label:"Export",disabled:true,options:[
                 {id:"btn-export-clipboard",label:"Clipboard",disabled:true,onselect:RED.view.showExportNodesDialog},
                 {id:"btn-export-library",label:"Library",disabled:true,onselect:RED.view.showExportNodesLibraryDialog}
                 ]},
                 */
                null,
                {id:"btn-config-nodes",label:"鑺傜偣閰嶇疆淇℃伅",onselect:RED.sidebar.config.show},


                /*
                 null,
                 {id:"btn-workspace-menu",label:"Workspaces",options:[
                 {id:"btn-workspace-add",label:"Add"},
                 {id:"btn-workspace-edit",label:"Rename"},
                 {id:"btn-workspace-delete",label:"Delete"},
                 null
                 ]},
                 */


                null,
                {id:"btn-help",label:"鍦ㄧ嚎鏂囨。", href:"http://www.borgnix.com/docs"}
            ]
        });

        RED.menu.init({id:"btn-deploy-options",
            options: [
                {id:"btn-deploy-flow",toggle:"deploy-type",icon:"images/deploy-flows.png",label:"褰撳墠缂栬緫鍦烘櫙",sublabel:"浠呴儴缃茬敤鎴峰綋鍓嶇紪杈戝満鏅�", onselect:function(s) {if(s){changeDeploymentType("flows")}}},
                {id:"btn-deploy-full",toggle:"deploy-type",icon:"images/deploy-full.png",label:"鎵€鏈夊満鏅�",sublabel:"閲嶆柊閮ㄧ讲鐢ㄦ埛鎵€鏈夊満鏅�",onselect:function(s) { if(s){changeDeploymentType("full")}}},
                //{id:"btn-deploy-node",toggle:"deploy-type",icon:"images/deploy-nodes.png",label:"Modified Nodes",sublabel:"Only deploys nodes that have changed",onselect:function(s) { if(s){changeDeploymentType("nodes")}}}
            ]
        });

        if (RED.settings.user) {
            RED.menu.init({id:"btn-usermenu",
                options: []
            });

            var updateUserMenu = function() {
                $("#btn-usermenu-submenu li").remove();
                if (RED.settings.user.anonymous) {
                    RED.menu.addItem("btn-usermenu",{
                        id:"btn-login",
                        label:"Login",
                        onselect: function() {
                            RED.user.login({cancelable:true},function() {
                                RED.settings.load(function() {
                                    RED.notify("Logged in as "+RED.settings.user.username,"success");
                                    updateUserMenu();
                                });
                            });
                        }
                    });
                } else {
                    RED.menu.addItem("btn-usermenu",{
                        id:"btn-username",
                        label:"<b>"+RED.settings.user.username+"</b>"
                    });
                    RED.menu.addItem("btn-usermenu",{
                        id:"btn-logout",
                        label:"Logout",
                        onselect: function() {
                            RED.user.logout();
                        }
                    });
                }

            }
            updateUserMenu();
        } else {
            $("#btn-usermenu").parent().hide();
        }

        $("#main-container").show();
        $(".header-toolbar").show();

        RED.library.init();
        RED.palette.init();
        RED.sidebar.init();
        RED.view.init();

        RED.keyboard.add(/* ? */ 191,{shift:true},function(){showHelp();d3.event.preventDefault();});
        RED.comms.connect();
        loadNodeList();
    }


    return {
    };
})();

RED.view = (function() {
    var space_width = 5000,
        space_height = 5000,
        lineCurveScale = 0.75,
        scaleFactor = 1,
        node_width = 70,
        node_height = 70;

    var touchLongPressTimeout = 1000,
        startTouchDistance = 0,
        startTouchCenter = [],
        moveTouchCenter = [],
        touchStartTime = 0;


    var activeWorkspace = 0;
    var activeSubflow = null;
    
    var workspaceScrollPositions = {};

    var selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mousedown_port_type = null,
        mousedown_port_index = 0,
        mouseup_node = null,
        mouse_offset = [0,0],
        mouse_position = null,
        mouse_mode = 0,
        moving_set = [],
        dirty = false,
        lasso = null,
        showStatus = false,
        lastClickNode = null,
        dblClickPrimed = null,
        clickTime = 0,
        clickElapsed = 0;

    var clipboard = "";

    var status_colours = {
        "red":    "#c00",
        "green":  "#5a8",
        "yellow": "#F9DF31",
        "blue":   "#53A3F3",
        "grey":   "#d3d3d3"
    }


    function copySelection() {
        if (moving_set.length > 0) {
            var nns = [];
            for (var n=0;n<moving_set.length;n++) {
                var node = moving_set[n].n;
                if (node.type != "subflow") {
                    nns.push(RED.nodes.convertNode(node));
                }
            }
            clipboard = JSON.stringify(nns);
            RED.notify(nns.length+" node"+(nns.length>1?"s":"")+" copied");
        }
    }


    function calculateTextWidth(str, className, offset) {
        var sp = document.createElement("span");
        sp.className = className;
        sp.style.position = "absolute";
        sp.style.top = "-1000px";
        sp.innerHTML = (str||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        document.body.appendChild(sp);
        var w = sp.offsetWidth;
        document.body.removeChild(sp);
        return offset+w;
    }

    function resetMouseVars() {
        mousedown_node = null;
        mouseup_node = null;
        mousedown_link = null;
        mouse_mode = 0;
        mousedown_port_type = 0;
    }

    function portMouseDown(d,portType,portIndex) {
        //console.log(d,portType,portIndex);
        // disable zoom
        //vis.call(d3.behavior.zoom().on("zoom"), null);
        mousedown_node = d;
        selected_link = null;
        mouse_mode = RED.state.JOINING;
        mousedown_port_type = portType;
        mousedown_port_index = portIndex || 0;
        document.body.style.cursor = "crosshair";
        d3.event.preventDefault();
    }

    function portMouseUp(d,portType,portIndex) {
        document.body.style.cursor = "";
        if (mouse_mode == RED.state.JOINING && mousedown_node) {
            if (typeof TouchEvent != "undefined" && d3.event instanceof TouchEvent) {
                RED.nodes.eachNode(function(n) {
                        if (n.z == activeWorkspace) {
                            var hw = n.w/2;
                            var hh = n.h/2;
                            if (n.x-hw<mouse_position[0] && n.x+hw> mouse_position[0] &&
                                n.y-hh<mouse_position[1] && n.y+hh>mouse_position[1]) {
                                    mouseup_node = n;
                                    portType = mouseup_node.inputs>0?1:0;
                                    portIndex = 0;
                            }
                        }
                });
            } else {
                mouseup_node = d;
            }
            if (portType == mousedown_port_type || mouseup_node === mousedown_node) {
                drag_line.attr("class", "drag_line_hidden");
                resetMouseVars();
                return;
            }
            var src,dst,src_port;
            if (mousedown_port_type === 0) {
                src = mousedown_node;
                src_port = mousedown_port_index;
                dst = mouseup_node;
            } else if (mousedown_port_type == 1) {
                src = mouseup_node;
                dst = mousedown_node;
                src_port = portIndex;
            }
            var existingLink = false;
            RED.nodes.eachLink(function(d) {
                existingLink = existingLink || (d.source === src && d.target === dst && d.sourcePort == src_port);
            });
            if (!existingLink) {
                var link = {source: src, sourcePort:src_port, target: dst};
                RED.nodes.addLink(link);
                RED.history.push({t:'add',links:[link],dirty:dirty});
                setDirty(true);
            } else {
            }
            selected_link = null;
            redraw();
        }
    }

    function nodeMouseUp(d) {
        if (dblClickPrimed && mousedown_node == d && clickElapsed > 0 && clickElapsed < 750) {
            mouse_mode = RED.state.DEFAULT;
            if (d.type != "subflow") {
                RED.editor.edit(d);
            } else {
                RED.editor.editSubflow(activeSubflow);
            }
            clickElapsed = 0;
            d3.event.stopPropagation();
            return;
        }
        var direction = d._def? (d.inputs > 0 ? 1: 0) : (d.direction == "in" ? 0: 1)
        portMouseUp(d, direction, 0);
    }



    /**
     * Imports a new collection of nodes from a JSON String.
     *  - all get new IDs assigned
     *  - all 'selected'
     *  - attached to mouse for placing - 'IMPORT_DRAGGING'
     */
    function importNodes(newNodesStr,touchImport) {
        try {
            var result = RED.nodes.import(newNodesStr,true);
            if (result) {
                var new_nodes = result[0];
                var new_links = result[1];
                var new_workspaces = result[2];
                var new_subflows = result[3];
                
                var new_ms = new_nodes.filter(function(n) { return n.z == activeWorkspace }).map(function(n) { return {n:n};});
                var new_node_ids = new_nodes.map(function(n){ return n.id; });

                // TODO: pick a more sensible root node
                if (new_ms.length > 0) {
                    var root_node = new_ms[0].n;
                    var dx = root_node.x;
                    var dy = root_node.y;

                    if (mouse_position == null) {
                        mouse_position = [0,0];
                    }

                    var minX = 0;
                    var minY = 0;
                    var i;
                    var node;

                    for (i=0;i<new_ms.length;i++) {
                        node = new_ms[i];
                        node.n.selected = true;
                        node.n.changed = true;
                        node.n.x -= dx - mouse_position[0];
                        node.n.y -= dy - mouse_position[1];
                        node.dx = node.n.x - mouse_position[0];
                        node.dy = node.n.y - mouse_position[1];
                        minX = Math.min(node.n.x-node_width/2-5,minX);
                        minY = Math.min(node.n.y-node_height/2-5,minY);
                    }
                    for (i=0;i<new_ms.length;i++) {
                        node = new_ms[i];
                        node.n.x -= minX;
                        node.n.y -= minY;
                        node.dx -= minX;
                        node.dy -= minY;
                    }
                    if (!touchImport) {
                        mouse_mode = RED.state.IMPORT_DRAGGING;
                    }

                    RED.keyboard.add(/* ESCAPE */ 27,function(){
                            RED.keyboard.remove(/* ESCAPE */ 27);
                            clearSelection();
                            RED.history.pop();
                            mouse_mode = 0;
                    });
                    clearSelection();
                    moving_set = new_ms;
                }

                RED.history.push({
                    t:'add',
                    nodes:new_node_ids,
                    links:new_links,
                    workspaces:new_workspaces,
                    subflows:new_subflows,
                    dirty:RED.view.dirty()
                });


                redraw();
            }
        } catch(error) {
            if (error.code != "NODE_RED") {
                console.log(error.stack);
                RED.notify("<strong>Error</strong>: "+error,"error");
            } else {
                RED.notify("<strong>Error</strong>: "+error.message,"error");
            }
        }
    }


    
    function showSubflowDialog(id) {
        RED.editor.editSubflow(RED.nodes.subflow(id));
    }
    function findAvailableSubflowIOPosition(subflow) {
        var pos = {x:70,y:70};
        for (var i=0;i<subflow.out.length+subflow.in.length;i++) {
            var port;
            if (i < subflow.out.length) {
                port = subflow.out[i];
            } else {
                port = subflow.in[i-subflow.out.length];
            }
            if (port.x == pos.x && port.y == pos.y) {
                pos.x += 55;
                i=0;
            }
        }
        return pos;
    }
    
    function addSubflowInput(id) {
        var subflow = RED.nodes.subflow(id);
        var position = findAvailableSubflowIOPosition(subflow);
        var newInput = {
            type:"subflow",
            direction:"in",
            z:subflow.id,
            i:subflow.in.length,
            x:position.x,
            y:position.y,
            id:RED.nodes.id()
        };
        var oldInCount = subflow.in.length;
        subflow.in.push(newInput);
        subflow.dirty = true;
        var wasDirty = RED.view.dirty();
        var wasChanged = subflow.changed;
        subflow.changed = true;
        
        RED.nodes.eachNode(function(n) {
            if (n.type == "subflow:"+subflow.id) {
                n.changed = true;
                n.inputs = subflow.in.length;
                RED.editor.updateNodeProperties(n);
            }
        });
        var historyEvent = {
            t:'edit',
            node:subflow,
            dirty:wasDirty,
            changed:wasChanged,
            subflow: {
                inputCount: oldInCount
            }
        };
        RED.history.push(historyEvent);
        $("#workspace-subflow-add-input").toggleClass("disabled",true);
        updateSelection();
        RED.view.redraw();
    }
        
    function addSubflowOutput(id) {
        var subflow = RED.nodes.subflow(id);
        var position = findAvailableSubflowIOPosition(subflow);
        
        var newOutput = {
            type:"subflow",
            direction:"out",
            z:subflow.id,
            i:subflow.out.length,
            x:position.x,
            y:position.y,
            id:RED.nodes.id()
        };
        var oldOutCount = subflow.out.length;
        subflow.out.push(newOutput);
        subflow.dirty = true;
        var wasDirty = RED.view.dirty();
        var wasChanged = subflow.changed;
        subflow.changed = true;
        
        RED.nodes.eachNode(function(n) {
            if (n.type == "subflow:"+subflow.id) {
                n.changed = true;
                n.outputs = subflow.out.length;
                RED.editor.updateNodeProperties(n);
            }
        });
        var historyEvent = {
            t:'edit',
            node:subflow,
            dirty:wasDirty,
            changed:wasChanged,
            subflow: {
                outputCount: oldOutCount
            }
        };
        RED.history.push(historyEvent);
        updateSelection();
        RED.view.redraw();
    }



})();
