package javaprojects.misc;

public class flow {
    public static void main(String[] args){
        int w = 16;
        int h = 32;
        double[][] direction = new double[w][h];
        double[][] velocity = new double[w][h];
        direction[0][0] = Math.PI/4;
        velocity[0][0] = 10;
        direction[3][3] = 0.2;
        velocity[3][3] = 10;
        direction[5][15] = -Math.PI/2;
        velocity[5][15] = 20;
        while(true){
            try{
                Thread.sleep(100);
                step(direction, velocity);
                render(direction, velocity);
                System.out.println('-');
            } catch(InterruptedException e){
                e.printStackTrace();
            }
        }
    }
    public static void render(double[][] input, double[][] input2){
         int w = input.length;
        int h = input[0].length;
        double max = Integer.MIN_VALUE;
        double min = Integer.MAX_VALUE;
        for(int x = 0; x<w; x++){
            for(int y= 0; y<h; y++){
                max = Math.max(max, Math.abs(input[x][y]));
                min = Math.min(min, Math.abs(input[x][y]));
            }
        }
        max++;


        double max2 = Integer.MIN_VALUE;
        double min2 = Integer.MAX_VALUE;
        for(int x = 0; x<w; x++){
            for(int y= 0; y<h; y++){
                max2 = Math.max(max2, Math.abs(input2[x][y]));
                min2 = Math.min(min2, Math.abs(input2[x][y]));
            }
        }
        max2++;
        StringBuilder stringAll = new StringBuilder();
        for(int row = 0; row<w; row++){
            StringBuilder stringr = new StringBuilder();
            stringr.append('|');
            for(int x = 0; x<h; x++){
                double scaled = (Math.abs(input[row][x]) - min)*26/max;
                char tc = (char) (Math.floor(scaled)+'A');
                if(tc == 'A') tc = ' ';
                stringr.append(tc);
            }
            stringr.append("|             |");
            for(int x = 0; x<h; x++){
                double scaled = (Math.abs(input2[row][x]) - min2)*26/max2;
                char tc = (char) (Math.floor(scaled)+'A');
                if(tc == 'A') tc = ' ';
                stringr.append(tc);
            }
            stringr.append('|');
            stringAll.append(stringr.toString());
            stringAll.append("\n");
        }
        System.out.print(stringAll.toString());
        /*StringBuilder all = new StringBuilder();
        for(int v = 0; v<input.length; v++){
            all.append('[');
            for(int j = 0; j<input[v].length; j++){
                all.append(String.valueOf((int) Math.floor(input[v][j])));
                all.append(" ");
            }
            all.append("]       [");
            for(int j = 0; j<input2[v].length; j++){
                all.append(String.valueOf((int) Math.floor(input2[v][j])));
                all.append(" ");
            }
            all.append("] \n");
        }
        System.out.println(all.toString());*/
    }
    public static void step(double[][] direction, double[][] velocity){
        int w = direction.length;
        int h = direction[0].length;
        double[][] dD = new double[w][h];
        double[][] dV = new double[w][h];
        for(int x = 0; x<w; x++){
            for(int y = 0; y<h; y++){
                double tx = x;
                double ty = y;
                double dx = Math.cos(direction[x][y]);
                double dy = Math.sin(direction[x][y]);
                double distToTravel = velocity[x][y];
                while(distToTravel>0){
                    tx+=dx;
                    ty+=dy;
                    distToTravel--;
                    int rtx = (int) tx;
                    int rty = (int) ty;
                    if(rtx<0 || rtx >= w || rty < 0 || rty >= h) break;
                    dD[rtx][rty] += (direction[rtx][rty]-direction[x][y])/(5*(velocity[x][y]-distToTravel));
                    dV[rtx][rty] += (velocity[rtx][rty]-velocity[x][y])*(2*Math.PI-(direction[rtx][rtx]-direction[x][y]))/(2*Math.PI*(velocity[x][y]-distToTravel));
                }
            }
        }
        for(int x = 0; x<w; x++){
            for(int y = 0; y<h; y++){
                direction[x][y]+=dD[x][y];
                velocity[x][y]+=dV[x][y];
            }
        }
    }
}