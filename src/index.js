"use strict";

var r = require("react-wrapper");
var lazyScroller = r.wrap(require("lazy-scroller"));
var mapTile = r.wrap(require("./map-tile"));

module.exports = {
  propTypes: function () {
    return {
      city: r.propTypes.string.isRequired,
      tileSize: r.propTypes.number.isRequired,
      firstTileColumn: r.propTypes.number.isRequired,
      lastTileColumn: r.propTypes.number.isRequired,
      firstTileRow: r.propTypes.number.isRequired,
      lastTileRow: r.propTypes.number.isRequired,
      initialTileCoords: r.propTypes.object.isRequired
    };
  },

  getInitialState: function () {
    return {};
  },

  componentDidMount: function () {
    this.updateDocumentTitle();
  },

  onRetarget: function (target) {
    var tileCoords = this.decodeTileCoords(target);
    this.setState({
        tileCoords: tileCoords
      });
    this.updateDocumentTitle();
  },

  updateDocumentTitle: function () {
    var title = this.props.city;
    if (this.state.tileCoords) {
      title += " — (" + this.state.tileCoords.x + "," + this.state.tileCoords.y + ")";
    }
    document.title = title;
  },

  encodeTileCoords: function (tileCoords) {
    return {
      x: tileCoords.x - this.props.firstTileColumn,
      y: this.props.lastTileRow - tileCoords.y
    };
  },

  decodeTileCoords: function (target) {
    return {
      x: this.props.firstTileColumn + target.x,
      y: this.props.lastTileRow - target.y
    };
  },

  encodeTarget: function (target) {
    var tileCoords = this.decodeTileCoords(target);
    return "#" + tileCoords.x + "," + tileCoords.y;
  },

  decodeTarget: function (hash) {
    if (!hash || hash[0] !== "#") {
      return undefined;
    }
    var tokens = hash.slice(1).split(",");
    if (tokens.length !== 2) {
      return undefined;
    }
    var tileCoords = {
      x: parseInt(tokens[0]),
      y: parseInt(tokens[1])
    };
    if (isNaN(tileCoords.x) || !tileCoords.x || isNaN(tileCoords.y) || !tileCoords.y) {
      return undefined;
    }
    return this.encodeTileCoords(tileCoords);
  },

  render: function () {
    var columnCount = this.props.lastTileColumn - this.props.firstTileColumn + 1;
    var rowCount = this.props.lastTileRow - this.props.firstTileRow + 1;
    var initialTarget = this.encodeTileCoords(this.props.initialTileCoords);
    return (
      lazyScroller({
          columnCount: columnCount,
          columnWidth: this.props.tileSize,
          rowCount: rowCount,
          rowHeight: this.props.tileSize,
          tileChild: mapTile,
          tileChildProps: {
            tileSize: this.props.tileSize,
            decodeTileCoords: this.decodeTileCoords
          },
          initialTarget: initialTarget,
          encodeTarget: this.encodeTarget,
          decodeTarget: this.decodeTarget,
          onRetarget: this.onRetarget
        }));
  }
};

r.makeComponent("MapViewer", module);
