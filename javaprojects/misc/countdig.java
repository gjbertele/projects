package javaprojects.misc;
import java.util.Math;

public class countdig {
    public static void main(String[] args){
        int k = 1;
        double double a = (double double) Math.pow(10,k);
        double double b = Math.round(-a*(1 + Math.sqrt(5))/2);
        int flips = 0;
        while(true){
            double double c = a + b;
            if(Math.sign(c) == Math.sign(b)) break;
            a = b;
            b = c;
            flips++;
        }
        System.out.println(flips);
    }
}
//712891,2345851