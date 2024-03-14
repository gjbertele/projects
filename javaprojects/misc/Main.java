package javaprojects.misc;

public class Main {
    public static void main(String[] args){
        int n = 0;
        long t = System.nanoTime();
        for(int y = -999; y < 1000; y++){
            for(int z = -999; z < 1000; z++){
                for(int w = -999; w < 1000; w++){
                    int b = Math.abs(z + y + w);
                    int c = Math.abs(z*y + z*w + w*y);
                    int d = Math.abs(z*y*w);
                    if(b < 1000 && c < 1000 && d < 1000){
                        int mx = Math.max(Math.max(b,c),d);
                        if(mx == 0) mx = 100000;
                        int m = 1000/mx;
                        n+=2*m;
                    }
                }
            }
        }
        System.out.println("count: "+n+" in: "+(System.nanoTime()-t)/1e6 + "ms");
    }
}
