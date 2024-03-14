package javaprojects.misc;
import java.util.ArrayList;

public class fibonacci {
    public static void main(String[] args){
        int j = Integer.parseInt(args[0]);
        ArrayList<Long> ns = new ArrayList<Long>();
        ns.add(0,(long) 163601214418);
        ns.add(1,(long) -101111111111);
        int l = 2;
        while(Math.abs(ns.get(l-1)) > 10){
            ns.add(ns.get(l-1)+ns.get(l-2));
            l++;
        }
        ns.remove(l-1);
        System.out.println(ns.toString());
    }
}