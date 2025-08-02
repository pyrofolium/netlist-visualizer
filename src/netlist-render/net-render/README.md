This folder contains code to render nets

Essentially it uses Dijkstra's algorithm for drawing the shortest
path between two points. A diagonal traversal costs 3 points,
a horizontal or vertical path costs 2 points. Crossing
over another wire will cost 20 points, and also the wire
turning or changing a direction will cost an extra one point.

nodes occupied by components cost infinite so the wire will
never cross another component.

This gives the wire drawing algorithm a tendency to avoid
changing directions as much as possible and to also go straight
or diagonally when it makes sense. It matches our own intuition
when drawing the shortest path by hand.

The basic algorithm starts off by finding all pins on the same net
then it draws a path between those 2 pins. It then connects all other
pins to that path using the same algorithm. 