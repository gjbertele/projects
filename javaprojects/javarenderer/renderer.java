package javaprojects.javarenderer;
import java.util.Arrays;
public class renderer {

    static camera Camera = new camera();

    static final int terminalWidth = 60;
    static final int terminalHeight = 60;
    static final int worldSize = 32;
    static final int worldHeight = 5;
    static final int worldSizeHalf = 16;
    static final float fov = (float)( terminalWidth*0.9);
    static final float fovInv = 1/fov;
    static final String[] idMap = {"  ","AA","BB","CC","DD","EE","FF","GG","HH","II","JJ","KK","LL","MM","NN","OO","PP","QQ","RR","SS","TT","UU","VV","WW","XX","YY","ZZ"};
    static final float mpdr = (float) Math.PI/180;
    static float[][] axisArray = {{1,0},{0,1}};
    static int[][] screen = new int[terminalHeight][terminalWidth];
    static float[][] heightMap = new float[worldSize][worldSize];
    static face[] faces = new face[worldHeight*worldSize*worldSize];
    static double lastFrameTime = 0;

    public static face createFace(float[][] points,int ID){
        point p1 = new point(points[0][0],points[0][1],points[0][2]);
        point p2 = new point(points[1][0],points[1][1],points[1][2]);
        point p3 = new point(points[2][0],points[2][1],points[2][2]);
        point p4 = new point(points[3][0],points[3][1],points[3][2]);
        return new face(new point[]{p1,p2,p3,p4},ID);
    }

    public static void drawBuffer(int[][] pixels){
        String mainstr = "";
        for(int ty = 0; ty<terminalHeight; ty++){
            String row = "";
            for(int tx = 0; tx<terminalWidth; tx++){
                row+=idMap[screen[ty][tx]];
            }
            mainstr+=row+"|\n";
        }
        System.out.print(mainstr);
    }

    public static point2D projectTo3D(float x, float y, float z){
        float ix = x - worldSizeHalf;
        float iy = y - Camera.y;
        float iz = z - worldSizeHalf;
        float rx = ix*axisArray[0][0] + iz*axisArray[1][0] - Camera.x;
        float rz = ix*axisArray[0][1] + iz*axisArray[1][1] - Camera.z;
        float size = rz*fovInv + 1;
        int xp = (int) (rx / size);
        int yp = (int) (iy / size);
        return new point2D(xp, yp);
        //add 3d rotation
    }

    public static boolean isPointInPolygon(point2D[] points, int tx, int ty){
        boolean inside = false;
        int j = points.length - 1;
        for(int i = 0; i<points.length; i++){
            int xi = points[i].x; int yi = points[i].y;
            int xj = points[j].x; int yj = points[j].y;

            if((yi > ty != yj > ty) && (tx < (xj - xi) * (ty - yi) / (yj - yi) + xi)){
                inside = !inside;
            }

            j = i;
        }
        return inside;
    }
    public static void drawPolygon2(point2D[] points,int id){
        int ca = 1;
        int cb = 3;
        if(points[0].y < points[1].y){
            ca = 0;
        }
        if(points[2].y < points[3].y){
            cb = 2;
        }
        int ls2 = cb;
        if(points[ca].y < points[cb].y){
            ls2 = ca;
        }
        int ls1 = (ls2 + 3) % 4;
        int ls3 = (ls2 + 5) % 4;
        int ls4 = (ls2 + 6) % 4;
        point2D top = points[ls4];
        point2D bottom = points[ls2];
        point2D right = points[ls1];
        point2D left = points[ls3];
        boolean render = true;
        for(point2D i : points){
            if(i.x < 0 || i.x > terminalWidth-1 || i.y > terminalHeight-1 || i.y < 0){
                render = false;
                break;
            }
        }
        if(render == true){
        if(top.x - left.x != 0 && top.x - right.x != 0 && bottom.x - left.x != 0 && bottom.x - right.x != 0){
        float slopelt = (top.y - left.y)/(top.x - left.x);
        float slopetr = (right.y - top.y)/(right.x - top.x);
        float slopelb = (bottom.y - left.y)/(bottom.x - left.x);
        float slopebr = (right.y - bottom.y)/(right.x - bottom.x);
        //y = m(x-x1) + y1
        for(int tx = left.x; tx<right.x; tx++){
            int topY = 0;
            int bottomY = 0;
            if(tx>top.x){
                topY = (int) (slopetr*(tx-top.x) + top.y);
            } else {
                topY = (int) (slopelt*(tx-top.x) + top.y);
            }
            if(tx > bottom.x){
                bottomY = (int) (slopebr*(tx - bottom.x) + bottom.y);
            } else {
                bottomY = (int) (slopelb*(tx - bottom.x) + bottom.y);
            }
            if(bottomY>0 && topY<terminalHeight-1){
            for(int ty = bottomY; ty<topY; ty++){
                screen[ty][tx] = id;
            }
        }
        }
    } else {
        int mx1 = 0;
        int mx2 = 2;
        int maxX = 0;
        int minX = 0;
        if(points[1].x > points[0].x){
            mx1 = 1;
        }
        if(points[3].x>points[2].x){
            mx2 = 3;
        }
        if(points[mx1].x>points[mx2].x){
            maxX = points[mx1].x;
        } else {
            maxX = points[mx2].x;
        }
        int nt1 = mx1 + 1 - ((mx1 & 1)<<1);
        int nt2 = mx2 + 1 - ((mx2 & 1)<<1);
        if(points[nt1].x<points[nt2].x){
            minX = points[nt1].x;
        } else {
            minX = points[nt2].x;
        }
        
    for(int ty = bottom.y; ty<top.y; ty++){
        for(int tx = minX; tx<maxX; tx++){
            screen[ty][tx] = id;
        }
    }
}
}

        
        
        /*
         * find lowest point
         * -> low line is 2 lines connected to that point
         * -> top line is opposite
         * 
         * which lowline being used is determined by x being greater or less than low vertex x
         * -> same for top
         * 
         * slope
         * -> cached?
         *   -> cache line related values?
         * 
         * get values for top and bottom lines between certain pts
         * iterate over pts between
         */
    }



    public static void generateWorld(){
        heightMap = new float[worldSize][worldSize];
        for(int terrainX = 0; terrainX < worldSize; terrainX++){
            for(int terrainY = 0; terrainY < worldSize; terrainY++){
                //f(x)
                heightMap[terrainX][terrainY] += 2*terrainX*terrainX;
            }
        }
        for(int terrainX = 0; terrainX < worldSize - 1; terrainX++){
            for(int terrainY = 0; terrainY < worldSize - 1; terrainY++){
                float[][] pointsArr = new float[][]{{terrainX,heightMap[terrainX][terrainY],terrainY},{terrainX+1,heightMap[terrainX+1][terrainY],terrainY},{terrainX+1,heightMap[terrainX+1][terrainY+1],terrainY+1},{terrainX,heightMap[terrainX][terrainY+1],terrainY+1}};
                faces[terrainX*worldSize + terrainY] = createFace(pointsArr,Math.min((int) (heightMap[terrainX][terrainY]+1),25));
            }
        }
    }

    public static float compareDist(face a,face b){
        return 1;
    }

    public static void renderWorld(){
        for(face i : faces){
            if(i != null){
            point[] ipts = i.points;
            point2D[] polygonVs = new point2D[ipts.length];
            int v = 0;
            for(point p : ipts){
                polygonVs[v] = projectTo3D(p.x, -p.y, p.z);
                v++;
            }
            drawPolygon2(polygonVs, i.ID);
        }
        }
    }

    public static void updateRotationMatrix(){
        float angle = Camera.rx*mpdr;
        axisArray[0][0] = (float) Math.cos(angle);
        axisArray[0][1] = (float) Math.sin(angle);
        axisArray[1][0] = -axisArray[0][1];
        axisArray[1][1] = axisArray[0][0];
    }
 
    public static void frame(){
        screen = new int[terminalHeight][terminalWidth];
        double t1 = System.nanoTime();
        renderWorld();
        double t2 = System.nanoTime();
        drawBuffer(screen);
        double t3 = System.nanoTime();
        String consoleinfo = (int)((t2-t1)/1e6)+ ", " + ((int)((t3-t2)/1e6)) +", "+(int)(1e9/(System.nanoTime()-lastFrameTime))+"\n("+Camera.x+", "+Camera.y+", "+Camera.z+")";
        System.out.println(consoleinfo);
        lastFrameTime = System.nanoTime();
    }

    public static void main(String[] args){
        boolean a = true;
        if(a){
        generateWorld();
        do{
            try{
                frame();
                Camera.rx+=0.2;
                updateRotationMatrix();
                Thread.sleep(5);
            } catch(InterruptedException e){
                e.printStackTrace();
            }
        } while(true);
        }
    }
    
}
