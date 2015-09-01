"use strict";

var r = require("react-wrapper");
var http = require("http-request-wrapper");

module.exports = {
  propTypes: function () {
    return {
      tileSize: r.propTypes.number.isRequired,
      decodeTileCoords: r.propTypes.func.isRequired,
      x: r.propTypes.number.isRequired,
      y: r.propTypes.number.isRequired
    };
  },

  getInitialState: function () {
    return {
      roadLinks: [],
      roadNodes: []
    };
  },

  componentDidMount: function () {
    var tileCoords = this.props.decodeTileCoords(this.props);
    var tileId = "tile-" + tileCoords.x + "-" + tileCoords.y;
    var tileExt = process.env.NODE_ENV === "production" ? ".json.gz" : ".json";
    http.getJsonResource("/json/" + tileId + tileExt, function (tile, err) {
        if (tile && this.isMounted()) {
          this.setState({
              roadLinks: tile.roadLinks || [],
              roadNodes: tile.roadNodes || []
            });
        }
      }.bind(this));
  },

  render: function () {
    var tileCoords = this.props.decodeTileCoords(this.props);
    var tileSize = this.props.tileSize;
    var dx = tileSize * tileCoords.x;
    var dy = tileSize * tileCoords.y;
    function getX(p) {
      return p.x - dx;
    }
    function getY(p) {
      return tileSize - (p.y - dy);
    }
    function getCoords(p) {
      return getX(p) + "," + getY(p);
    }
    return (
      r.svg({
          width: "100%",
          height: "100%"
        },
        this.state.roadLinks.map(function (roadLink, i) {
            return (
              r.polyline({
                  key: "l-" + i,
                  points: roadLink.ps.map(getCoords).join(" "),
                  fill: "none",
                  stroke: "#999",
                  strokeWidth: 2
                }));
          }),
        this.state.roadNodes.map(function (roadNode, i) {
            return (
              r.circle({
                  key: "n-" + i,
                  cx: getX(roadNode.p),
                  cy: getY(roadNode.p),
                  r: 2,
                  fill: "#fff",
                  stroke: "#999",
                  strokeWidth: 2
                }));
          }),
        r.rect({
            x: 0,
            y: 0,
            width: this.props.tileSize,
            height: this.props.tileSize,
            fill: "none",
            stroke: "#ccc",
            strokeWidth: 1
          }),
        r.text({
            x: 5,
            y: 15,
            fontSize: 12,
            fill: "#f0690f"
          },
          "(" + tileCoords.x + "," + tileCoords.y + ")"
        )));
  }
};

r.makeComponent("MapTile", module);
