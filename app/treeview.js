import React from 'react'

var Treenode = React.createClass({
  propTypes: {
    'data': React.PropTypes.shape({
      'id': React.PropTypes.string.isRequired,
      'text': React.PropTypes.string.isRequired,
      'icon': React.PropTypes.string,
      'opened': React.PropTypes.bool,
      'disabled': React.PropTypes.bool,
      'selected': React.PropTypes.bool
    })
  },

  getInitialState: function() {
    return {
      'data': this.props.data
    };
  },

  arrowClicked: function() {
    this.state.data.opened = !this.state.data.opened;
    this.setState({
      'data' : this.props.data
    });
  },

  textClicked: function() {
    if (this.props.onTreenodeClick) {
      this.props.onTreenodeClick.apply(this, arguments);
    }
  },

  handleContextMenu: function (e) {
    var args = Array.prototype.slice.call(arguments)
    args.push(this.props.data)
    if (this.props.onTreenodeContextMenu) {
      this.props.onTreenodeContextMenu.apply(this, args);
    }
  },

  render: function() {
    var className = 'treenode';
    var nodeTextClass = 'node-text';
    if (this.props.data.opened) {
      className += ' node-opened';
    }
    else {
      className += ' node-closed';
    }
    if (this.props.data.selected) {
      nodeTextClass += ' node-selected';
    }

    return (
      <div
        {...this.props}
        className={className}>
        <div
          className='arrow'
          onClick={this.arrowClicked}>
            ▾
        </div>
        <i className={'node-icon ' + this.props.data.icon}>
        </i>
        <div
          className={nodeTextClass}
          onClick={this.textClicked.bind(this, this.props.data.id)}
          onContextMenu={this.handleContextMenu}>
          {this.props.data.text}
        </div>
        {this.props.children}
      </div>
    );
  }
});

var Treeview = React.createClass({
  propTypes: {
    'dataSource': React.PropTypes.array
  },

  dfs: function (callback) {
    var data = {
      id: '#',
      children: this.props.dataSource
    };

    helper(data);

    function helper(node) {
      var res = false;
      node.children.map(function (child) {
        helper(child);
      });
      callback(node);
    }
  },

  bfs: function (callback) {
    var data = {
      id: '#',
      children: this.props.dataSource
    };

    helper(data);

    function helper(node) {
      var queue = [];
      var next = node;
      while (next) {
        callback(next);
        next.children.map(function (child) {
          queue.push(child);
        });
        next = queue.shift();
      }
    }
  },

  render: function () {
    var className = '';
    var that = this;
    return (
      <div>
        {this.props.dataSource.map(function (data, i) {
          return (
            <Treenode data={data} className={className}
                      onTreenodeClick={that.props.onTreenodeClick}
                      onTreenodeContextMenu={that.props.onTreenodeContextMenu}>
              {data.children.map(function (node, i) {
                  return iter(node, that.props.onTreenodeClick, that.props.onTreenodeContextMenu);
              })}
            </Treenode>
          );
        })}
      </div>
    );
  }
});

function iter(node, treenodeClick, treenodeContextMenu) {
  return (
    <Treenode data={node}
              onTreenodeClick={treenodeClick}
              onTreenodeContextMenu={treenodeContextMenu}>
      {node.children.map(function (val) {
        return iter(val, treenodeClick);
      })}
    </Treenode>
  );
}

export default Treeview
